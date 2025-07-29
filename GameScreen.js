/**
 * Bubble Popper Game
 * 
 * ============== GAME OVERVIEW ==============
 * A bubble shooting game built with React Native and Expo.
 * 
 * CURRENT IMPLEMENTATION:
 * - Bubble Spawning: Random horizontal positions every 0.5s
 * - Bubble Movement: Upward motion until off-screen
 * - Static Gun: Fixed at bottom center
 * - Basic Laser: Vertical red line appearing for 0.3s on tap
 * - Simple Hit Detection: X-axis distance comparison
 * - Game Flow: Start screen, 120s countdown, score tracking, game over screen
 * 
 * ============== STUDENT ASSIGNMENT ==============
 * Your task is to extend this game by implementing a movable gun that can
 * fire in different directions to make the game more engaging.
 * 
 * ASSESSMENT CRITERIA:
 * 1. Functionality: Gun movement and response to input
 * 2. Code Quality: Structure, comments, efficiency
 * 3. User Experience: Intuitive gameplay, visual appeal
 * 4. Creativity: Unique features beyond requirements
 * 5. Performance: Smooth operation without issues
 * 
 * TIPS:
 * - Use React Native's touch handling for smooth control
 * - Consider Animated API for smoother animations
 * - Clean up any event listeners or timers you add
 * - Test on different device sizes for responsive UI
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Bubble from './components/Bubble';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GameScreen() {
  /**
   * Game State
   * 
   * These state variables manage the core game functionality:
   * - gameStarted/gameOver: Control game flow
   * - score/timeLeft: Track player progress
   * - bubbles: Array of bubble objects with positions
   * - laserVisible: Controls when the laser is shown
   */
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [bubbles, setBubbles] = useState([]);
  const [laserVisible, setLaserVisible] = useState(false);
  
  /**
   * ============== STUDENT TASK 1 ==============
   * TODO: IMPLEMENT MOVABLE GUN
   * 
   * Currently the gun is fixed in the middle. Modify this code to:
   * 1. Add state to track gun position (both X and Y coordinates)
   * 2. Allow the gun to move based on user input (e.g., touch/drag or buttons)
   * 3. Ensure the gun stays within screen boundaries
   * 
   * Example implementation approach:
   * const [gunPosition, setGunPosition] = useState({ 
   *   x: screenWidth / 2 - gunWidth / 2, 
   *   y: screenHeight - 70
   * });
   */
  
  // Fixed gun position - currently in the middle (MODIFY THIS)
  const gunWidth = 60;
  const gunPosition = screenWidth / 2 - gunWidth / 2;
  const gunCenterX = screenWidth / 2;
  
  /**
   * ============== STUDENT TASK 2 ==============
   * TODO: IMPLEMENT GUN MOVEMENT
   * 
   * Add functions to:
   * 1. Handle touch/drag events to move the gun
   * 2. Update the gun position state
   * 3. Add visual feedback for active controls
   * 
   * Example implementation approach:
   * const handleTouchMove = (event) => {
   *   const { locationX, locationY } = event.nativeEvent;
   *   // Apply constraints to keep gun on screen
   *   setGunPosition({ x: locationX - gunWidth/2, y: locationY });
   * };
   */
  
  // Refs for game timers and IDs
  const bubbleIdRef = useRef(1);
  const timerRef = useRef(null);
  const bubbleTimerRef = useRef(null);
  const laserTimeoutRef = useRef(null);
  
  /**
   * Handle tap to shoot laser
   * Currently fires the laser on any tap when game is active
   */
  const handleTap = () => {
    if (!gameStarted || gameOver) return;
    fireLaser();
  };
  
  /**
   * Fire a laser from the gun center
   * Creates visible laser and checks for bubble hits
   */
  const fireLaser = () => {
    // Clear any existing laser timeout
    if (laserTimeoutRef.current) {
      clearTimeout(laserTimeoutRef.current);
    }
    
    // Make laser visible
    setLaserVisible(true);
    
    /**
     * ============== STUDENT TASK 3 ==============
     * TODO: MODIFY LASER FIRING
     * 
     * Currently the laser always fires from the center.
     * Update this to:
     * 1. Fire from the current gun position
     * 2. Consider firing angle/direction based on gun orientation
     * 3. Add visual or sound effects for better feedback
     * 
     * Example implementation approach:
     * - Calculate laser end point based on angle
     * - Update laser rendering to show angled beam
     * - Add impact effects when laser hits bubbles
     */
    
    // Check for hits immediately
    checkHits(gunCenterX);
    
    // Make laser disappear after 300ms
    laserTimeoutRef.current = setTimeout(() => {
      setLaserVisible(false);
    }, 300);
  };
  
  /**
   * Check if laser hits any bubbles
   * @param {number} laserX - X coordinate of the laser
   */
  const checkHits = (laserX) => {
    setBubbles(prevBubbles => {
      const hitBubbleIds = [];
      let hitCount = 0;
      
      /**
       * ============== STUDENT TASK 4 ==============
       * TODO: IMPROVE COLLISION DETECTION
       * 
       * The current collision only works on X axis.
       * Enhance it to:
       * 1. Consider both X and Y coordinates
       * 2. Account for gun position and angle
       * 3. Add smarter targeting or auto-aiming features
       * 
       * Example implementation approach:
       * - Calculate distance between laser line and bubble center
       * - Use line-circle intersection algorithms for angled lasers
       * - Consider adding laser width for more realistic collision
       */
      
      // Check each bubble for collision
      prevBubbles.forEach(bubble => {
        // Calculate bubble center
        const bubbleCenterX = bubble.x + bubble.radius;
        
        // Check if laser x-coordinate is within bubble's horizontal range
        const distanceX = Math.abs(bubbleCenterX - laserX);
        
        // If laser is within bubble radius, it's a hit
        if (distanceX <= bubble.radius) {
          hitBubbleIds.push(bubble.id);
          hitCount++;
        }
      });
      
      // If any bubbles were hit, update the score
      if (hitCount > 0) {
        setScore(prevScore => prevScore + hitCount);
      }
      
      // Return bubbles that weren't hit
      return prevBubbles.filter(bubble => !hitBubbleIds.includes(bubble.id));
    });
  };
  
  /**
   * Spawn a new bubble with random horizontal position
   * Creates bubble at bottom of screen with random X position
   */
  const spawnBubble = () => {
    const radius = 30;
    // Ensure bubble stays within screen bounds
    const maxX = screenWidth - (radius * 2);
    const newBubble = {
      id: bubbleIdRef.current++,
      x: Math.random() * maxX,
      y: screenHeight - 100, // Start near bottom of screen
      radius: radius,
    };
    
    setBubbles(prev => [...prev, newBubble]);
  };
  
  /**
   * Start the game
   * Initializes game state and starts timers for bubble spawning and countdown
   */
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(120);
    setBubbles([]);
    setLaserVisible(false);
    bubbleIdRef.current = 1;
    
    // Start spawning bubbles every 500ms
    bubbleTimerRef.current = setInterval(spawnBubble, 500);
    
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Game over
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
   * Reset game
   * Returns game to initial state and cleans up timers
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
  
  /**
   * Move bubbles upward
   * Uses effect to animate bubbles moving up the screen
   */
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const moveInterval = setInterval(() => {
      setBubbles(prev => {
        const updatedBubbles = prev
          .map(bubble => ({
            ...bubble,
            y: bubble.y - 2, // Move bubbles up
          }))
          .filter(bubble => bubble.y > -60); // Remove bubbles that exit the top
        
        return updatedBubbles;
      });
    }, 16); // ~60 FPS
    
    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver]);
  
  /**
   * Cleanup on unmount
   * Ensures all timers are cleared when component unmounts
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bubbleTimerRef.current) clearInterval(bubbleTimerRef.current);
      if (laserTimeoutRef.current) clearTimeout(laserTimeoutRef.current);
    };
  }, []);
  
  return (
    <View style={styles.container}>
      {/* Game area */}
      <TouchableWithoutFeedback onPress={handleTap} disabled={!gameStarted || gameOver}>
        <View style={styles.gameArea}>
          {/* Bubbles */}
          {bubbles.map(bubble => (
            <Bubble
              key={`bubble-${bubble.id}`}
              x={bubble.x}
              y={bubble.y}
              radius={bubble.radius}
            />
          ))}
          
          {/**
           * ============== STUDENT TASK 5 ==============
           * TODO: MODIFY LASER RENDERING
           * Currently the laser is a simple vertical line.
           * Enhance it to:
           * 1. Render based on gun position and angle
           * 2. Add visual effects (color, thickness, etc.)
           * 3. Consider adding a cooldown or power meter
           */}
          
          {/* Laser - currently fixed to fire from center of gun */}
          {laserVisible && (
            <View
              style={[
                styles.laser,
                { left: gunCenterX - 2 } // Center the 4px wide laser from gun center
              ]}
            />
          )}
          
          {/**
           * ============== STUDENT TASK 6 ==============
           * TODO: MODIFY GUN RENDERING
           * Currently the gun is fixed at the bottom center.
           * Update it to:
           * 1. Use the gun position state you created
           * 2. Add visual indication of gun direction/angle
           * 3. Add controls or touch areas for movement
           */}
          
          {/* Gun - currently static in middle */}
          <View style={[styles.gun, { left: gunPosition }]}>
            <View style={styles.gunBase} />
            <View style={styles.gunBarrel} />
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Score and Timer */}
      <View style={styles.hudContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.scoreText}>Time: {timeLeft}s</Text>
      </View>
      
      {/* Start Screen */}
      {!gameStarted && !gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.title}>Bubble Popper</Text>
          <TouchableWithoutFeedback onPress={startGame}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Start Game</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
      
      {/* Game Over Screen */}
      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.title}>Game Over</Text>
          <Text style={styles.scoreText}>Final Score: {score}</Text>
          <TouchableWithoutFeedback onPress={resetGame}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Play Again</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </View>
  );
}

/**
 * ============== STUDENT TASK 7 ==============
 * TODO: ENHANCE THE STYLING
 * Consider adding styles for:
 * 1. Different gun states (active, cooldown)
 * 2. Enhanced laser effects
 * 3. Controls for gun movement
 * 4. Power-ups or special ability indicators
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000033',
  },
  gameArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  hudContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 30,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  scoreText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gun: {
    position: 'absolute',
    bottom: 10,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    backgroundColor: '#555',
    borderRadius: 5,
  },
  gunBase: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 20,
    backgroundColor: '#333',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  gunBarrel: {
    position: 'absolute',
    bottom: 20,
    width: 10,
    height: 30,
    backgroundColor: '#222',
  },
  laser: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#ff0000',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 90,
  },
});
