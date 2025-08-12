
// Main React Native imports
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, PanResponder, Image, Pressable } from 'react-native';
// Bubble component for rendering bubbles
import Bubble from './components/Bubble';

// Get device screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Main game screen component for Bubble Popper.
 * Handles game state, rendering, and user interaction.
 */
export default function GameScreen() {
  // --- State variables ---
  // Whether the game has started
  const [gameStarted, setGameStarted] = useState(false);
  // Whether the game is over
  const [gameOver, setGameOver] = useState(false);
  // Player's score
  const [score, setScore] = useState(0);
  // Time left in seconds
  const [timeLeft, setTimeLeft] = useState(120);
  // Array of bubble objects
  const [bubbles, setBubbles] = useState([]);
  // Whether the laser is currently visible
  const [laserVisible, setLaserVisible] = useState(false);

  // Gun width in pixels
  const gunWidth = 60;
  // Gun's horizontal position (left offset)
  const [gunPosition, setGunPosition] = useState(screenWidth / 2 - gunWidth / 2);

  // --- Tap/drag tracking for gun ---
  // Timestamp when tap/drag starts
  const tapStartTime = useRef(0);
  // X position when tap/drag starts
  const tapStartX = useRef(0);
  // Max duration (ms) and movement (px) to consider a tap
  const TAP_MAX_DURATION = 200;
  const TAP_MAX_MOVEMENT = 10;

  // X coordinate of the center of the gun
  const gunCenterX = gunPosition + gunWidth / 2;

  // --- Refs for timers and IDs ---
  // Unique bubble ID counter
  const bubbleIdRef = useRef(1);
  // Game timer interval ref
  const timerRef = useRef(null);
  // Bubble spawn timer interval ref
  const bubbleTimerRef = useRef(null);
  // Laser visibility timeout ref
  const laserTimeoutRef = useRef(null);

  /**
   * Handles tap or short press to fire the laser.
   */
  const handleTap = () => {
    if (!gameStarted || gameOver) return;
    fireLaser();
  };

  /**
   * Fires the laser, checks for hits, and shows the laser briefly.
   */
  const fireLaser = () => {
    if (laserTimeoutRef.current) clearTimeout(laserTimeoutRef.current);
    setLaserVisible(true);
    checkHits(gunCenterX);
    laserTimeoutRef.current = setTimeout(() => setLaserVisible(false), 300);
  };

  /**
   * Checks if the laser hits any bubbles and updates score/bubbles.
   * @param {number} laserX - X coordinate of the laser
   */
  const checkHits = (laserX) => {
    setBubbles(prevBubbles => {
      const hitBubbleIds = [];
      let hitCount = 0;
      prevBubbles.forEach(bubble => {
        const bubbleCenterX = bubble.x + bubble.radius;
        if (Math.abs(bubbleCenterX - laserX) <= bubble.radius) {
          hitBubbleIds.push(bubble.id);
          hitCount++;
        }
      });
      if (hitCount > 0) setScore(prevScore => prevScore + hitCount);
      return prevBubbles.filter(bubble => !hitBubbleIds.includes(bubble.id));
    });
  };

  /**
   * Spawns a new bubble at a random horizontal position.
   */
  const spawnBubble = () => {
    const radius = 30;
    const maxX = screenWidth - (radius * 2);
    setBubbles(prev => [
      ...prev,
      { id: bubbleIdRef.current++, x: Math.random() * maxX, y: screenHeight - 100, radius }
    ]);
  };

  /**
   * Starts the game: resets state, starts timers for bubbles and countdown.
   */
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(120);
    setBubbles([]);
    setLaserVisible(false);
    bubbleIdRef.current = 1;
    // Start bubble spawn interval
    bubbleTimerRef.current = setInterval(spawnBubble, 500);
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(bubbleTimerRef.current);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Resets the game to initial state and clears all timers.
   */
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setBubbles([]);
    setScore(0);
    setTimeLeft(120);
    setLaserVisible(false);
    bubbleIdRef.current = 1;
    if (timerRef.current) clearInterval(timerRef.current);
    if (bubbleTimerRef.current) clearInterval(bubbleTimerRef.current);
  };

  // --- Effects ---
  // Moves bubbles upward every frame while game is running
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const moveInterval = setInterval(() => {
      setBubbles(prev =>
        prev
          .map(bubble => ({ ...bubble, y: bubble.y - 2 })) // Move up by 2px
          .filter(bubble => bubble.y > -60) // Remove bubbles off screen
      );
    }, 16); // ~60 FPS
    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bubbleTimerRef.current) clearInterval(bubbleTimerRef.current);
      if (laserTimeoutRef.current) clearTimeout(laserTimeoutRef.current);
    };
  }, []);

  /**
   * PanResponder for handling gun drag and tap-to-fire.
   * Only active when game is running.
   */
  const panResponder = useRef(
    PanResponder.create({
      // Allow pan responder for both touch and mouse
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // When drag/tap starts
      onPanResponderGrant: (evt, gestureState) => {
        tapStartTime.current = Date.now();
        tapStartX.current = gestureState.x0;
        let newX = gestureState.x0 - gunWidth / 2;
        setGunPosition(Math.max(0, Math.min(newX, screenWidth - gunWidth)));
      },
      // When dragging
      onPanResponderMove: (evt, gestureState) => {
        let newX = gestureState.moveX - gunWidth / 2;
        setGunPosition(Math.max(0, Math.min(newX, screenWidth - gunWidth)));
      },
      // When released: fire if it's a tap
      onPanResponderRelease: (evt, gestureState) => {
        const tapDuration = Date.now() - tapStartTime.current;
        const moveDistance = Math.abs(gestureState.moveX - tapStartX.current);
        if (tapDuration < TAP_MAX_DURATION && moveDistance < TAP_MAX_MOVEMENT) {
          handleTap();
        }
      },
    })
  ).current;

  // --- Render ---
  return (
    <View style={styles.container}>
      <Image 
        source={require('./assets/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
  {/* Only attach PanResponder when game is running */}
      <View
        style={styles.gameArea}
        {...(gameStarted && !gameOver ? panResponder.panHandlers : {})}
        {...(gameStarted && !gameOver ? { onStartShouldSetResponder: () => true, onResponderRelease: handleTap } : {})}
      >
        {/* Render all bubbles */}
        {bubbles.map(bubble => (
          <Bubble key={`bubble-${bubble.id}`} x={bubble.x} y={bubble.y} radius={bubble.radius} />
        ))}

        {/* Render laser if visible */}
        {laserVisible && (
          <View style={[styles.laser, { left: gunCenterX - 2 }]} />
        )}

  {/* Gun with larger touch area for easier dragging */}
        <View style={[styles.gunTouchArea, { left: gunPosition }]}
        >
          <View style={styles.gun} pointerEvents="none">
            <Image
              source={require('./assets/bottle.png')}
              style={styles.ketchupImage}
              resizeMode="contain"
            />
          </View>
        </View>

  {/* HUD: Score and Time */}
        <View style={styles.hudContainer}>
          <Text style={styles.scoreText}>Score: {score}</Text>
          <Text style={styles.scoreText}>Time: {timeLeft}s</Text>
        </View>

  {/* Overlays: Start and Game Over screens */}
        {!gameStarted && !gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.title}>Bubble Popper</Text>
            <Pressable style={styles.button} onPress={startGame}>
              <Text style={styles.buttonText}>Start Game</Text>
            </Pressable>
          </View>
        )}

        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.title}>Game Over</Text>
            <Text style={styles.scoreText}>Final Score: {score}</Text>
            <Pressable style={styles.button} onPress={resetGame}>
              <Text style={styles.buttonText}>Play Again</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { 
    flex: 1 },
  backgroundImage: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    width: '100%', 
    height: '100%' 
  },
  gameArea: { 
    flex: 1, 
    width: '100%', 
    eight: '100%' 
  },
  hudContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    position: 'absolute', 
    top: 30, 
    left: 20, 
    right: 20, 
    zIndex: 10 },
  scoreText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  overlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 100 },
  title: { 
    color: 'white', 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 20 },
  button: { 
    backgroundColor: '#4CAF50', 
    paddingVertical: 12, 
    paddingHorizontal: 30, 
    borderRadius: 25, 
    marginTop: 20 },
  buttonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' },
  gunTouchArea: {
     position: 'absolute', 
     bottom: 0, 
     width: 80, 
     height: 80, 
     justifyContent: 'center', 
     alignItems: 'center', 
     zIndex: 50, 
     backgroundColor: 'transparent' },
  gun: { 
    width: 60, 
    height: 60, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#555', 
    borderRadius: 5 },
  ketchupImage: { 
    width: 50, 
    height: 50 },
  laser: { 
    position: 'absolute',
     top: 0, 
     width: 4, 
     height: '100%',
      backgroundColor: '#ff0000',
       shadowColor: '#ff0000',
        shadowOffset: { 
          width: 0,
           height: 0 }, 
           shadowOpacity: 1, 
           shadowRadius: 10,
            elevation: 20, 
            zIndex: 90 },
});
