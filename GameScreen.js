import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableWithoutFeedback, PanResponder, Image } from 'react-native';
import Bubble from './components/Bubble';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GameScreen() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [bubbles, setBubbles] = useState([]);
  const [laserVisible, setLaserVisible] = useState(false);
  
  const gunWidth = 60;
  const [gunPosition, setGunPosition] = useState(screenWidth / 2 - gunWidth / 2);

  const gunInitialX = useRef(gunPosition);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        gunInitialX.current = gunPosition;
      },
      onPanResponderMove: (evt, gestureState) => {
        let newX = gunInitialX.current + gestureState.dx;
        if (newX < 0) newX = 0;
        if (newX > screenWidth - gunWidth) newX = screenWidth - gunWidth;
        setGunPosition(newX);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const gunCenterX = gunPosition + gunWidth / 2;
  
  const bubbleIdRef = useRef(1);
  const timerRef = useRef(null);
  const bubbleTimerRef = useRef(null);
  const laserTimeoutRef = useRef(null);
  
  const handleTap = () => {
    if (!gameStarted || gameOver) return;
    fireLaser();
  };
  
  const fireLaser = () => {
    if (laserTimeoutRef.current) {
      clearTimeout(laserTimeoutRef.current);
    }
    setLaserVisible(true);
    checkHits(gunCenterX);
    laserTimeoutRef.current = setTimeout(() => {
      setLaserVisible(false);
    }, 300);
  };
  
  const checkHits = (laserX) => {
    setBubbles(prevBubbles => {
      const hitBubbleIds = [];
      let hitCount = 0;
      prevBubbles.forEach(bubble => {
        const bubbleCenterX = bubble.x + bubble.radius;
        const distanceX = Math.abs(bubbleCenterX - laserX);
        if (distanceX <= bubble.radius) {
          hitBubbleIds.push(bubble.id);
          hitCount++;
        }
      });
      if (hitCount > 0) {
        setScore(prevScore => prevScore + hitCount);
      }
      return prevBubbles.filter(bubble => !hitBubbleIds.includes(bubble.id));
    });
  };
  
  const spawnBubble = () => {
    const radius = 30;
    const maxX = screenWidth - (radius * 2);
    const newBubble = {
      id: bubbleIdRef.current++,
      x: Math.random() * maxX,
      y: screenHeight - 100,
      radius: radius,
    };
    setBubbles(prev => [...prev, newBubble]);
  };
  
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(120);
    setBubbles([]);
    setLaserVisible(false);
    bubbleIdRef.current = 1;
    bubbleTimerRef.current = setInterval(spawnBubble, 500);
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
  
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const moveInterval = setInterval(() => {
      setBubbles(prev => {
        return prev
          .map(bubble => ({
            ...bubble,
            y: bubble.y - 2,
          }))
          .filter(bubble => bubble.y > -60);
      });
    }, 16);
    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver]);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bubbleTimerRef.current) clearInterval(bubbleTimerRef.current);
      if (laserTimeoutRef.current) clearTimeout(laserTimeoutRef.current);
    };
  }, []);
  
  return (
    <View style={styles.container}>
      <Image 
        source={require('./assets/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.gameArea}>
        {bubbles.map(bubble => (
          <Bubble
            key={`bubble-${bubble.id}`}
            x={bubble.x}
            y={bubble.y}
            radius={bubble.radius}
          />
        ))}
        
        {laserVisible && (
          <View
            style={[
              styles.laser,
              { left: gunCenterX - 2 }
            ]}
          />
        )}
        
        <View
          style={[styles.gun, { left: gunPosition }]}
          {...panResponder.panHandlers}
        >
          <TouchableWithoutFeedback onPress={handleTap}>
            <View style={styles.gunTouchable}>
              <Image
                source={require('./assets/bottle.png')}
                style={styles.ketchupImage}
                resizeMode="contain"
              />
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={styles.hudContainer}>
          <Text style={styles.scoreText}>Score: {score}</Text>
          <Text style={styles.scoreText}>Time: {timeLeft}s</Text>
        </View>
        
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
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
  gunTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
