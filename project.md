# Bubble Popper Game - Student Assignment

## Overview

This assignment builds on a basic implementation of the Bubble Popper game built with React Native and Expo. The game currently includes core functionality, and your task is to enhance it by implementing a fully movable gun that can target and burst bubbles more effectively.

## Code Architecture

```
                      +-------------+
                      |             |
                      |    App.js   |
                      |             |
                      +------+------+
                             |
                             | (renders)
                             v
                 +-----------+------------+
                 |                        |
                 |     GameScreen.js      |<-----------------+
                 | (main game component)  |                  |
                 |                        |                  |
                 +-+--------+--------+----+                  |
                   |        |        |                       |
                   |        |        |                       |
    +------------+ | +------v------+ | +------------------+  |
    |            | | |             | | |                  |  |
    |   States   | | |  Functions  | | |     Rendering    |  |
    |            | | |             | | |                  |  |
    | gameStarted| | | handleTap() | | | - Game area      |  |
    | gameOver   | | | fireLaser() | | | - Bubbles        |  |
    | score      | | | checkHits() | | | - Laser          |  |
    | timeLeft   | | | spawnBubble()| | | - Gun           |  |
    | bubbles    | | | startGame() | | | - HUD            |  |
    | laserVisible| | | resetGame() | | | - Start/End     |  |
    |            | | |             | | |   screens        |  |
    +------------+ | +-------------+ | +------------------+  |
                   |                 |                       |
                   |                 |                       |
                   |                 |                       |
         +---------v-----------------v-------+               |
         |                                   |               |
         |            Bubble.js              +---------------+
         |      (bubble component)           |  (renders bubbles)
         |                                   |
         +-----------------------------------+
```

## Current Implementation

The base game includes the following features:

1. **Bubble Spawning**: Bubbles appear at random horizontal positions at the bottom of the screen every 0.5 seconds.
2. **Bubble Movement**: Each bubble moves upward at a constant speed until it leaves the top of the screen.
3. **Static Gun**: A fixed gun positioned at the bottom center of the screen.
4. **Basic Laser**: When the player taps the screen, a vertical red line appears from the gun position for 0.3 seconds.
5. **Simple Hit Detection**: If the laser's x-coordinate is within a bubble's radius, the bubble is removed and the score increases.
6. **Game Flow**: The game includes a start screen, 120-second countdown timer, score tracking, and game over screen.

## Your Assignment

Your task is to extend the game by implementing a fully movable gun that can fire in different directions. This will make the game more engaging and challenging.

### Required Tasks

#### Task 1: Implement Movable Gun State
- Add state variables to track the gun's position (both X and Y coordinates)
- Ensure the gun stays within the screen boundaries

#### Task 2: Implement Gun Movement Control
- Create functions to handle touch or drag events for moving the gun
- Update the gun position based on user input
- Add visual feedback to show the gun is being controlled

#### Task 3: Enhance Laser Firing Mechanism
- Modify the laser to fire from the current gun position instead of a fixed point
- Consider implementing directional firing (angles)
- Add visual or sound effects to make firing more engaging

#### Task 4: Improve Collision Detection
- Update the collision detection logic to consider both X and Y coordinates
- Account for the gun position and potential firing angle
- Consider implementing smarter targeting or auto-aim features

#### Task 5: Enhance Laser Rendering
- Update the laser visual to properly align with the gun position and angle
- Improve laser visuals with effects like color gradients or particle effects
- Consider adding a cooldown mechanism or power meter for firing

#### Task 6: Enhance Gun Rendering
- Update the gun rendering to reflect its current position
- Add visual indication of the gun's firing direction
- Implement controls or touch areas for intuitive gun movement

#### Task 7: Improve Game Styling
- Add styling for different gun states (ready, firing, cooldown)
- Enhance laser effects and animations
- Add visual elements for controls or power-ups

## Data Flow

```
User Input → Gun Position → Laser Firing → Collision Detection → Score Update
                ↓                ↓                ↓                   ↓
           Gun Rendering    Laser Rendering    Bubble Removal    HUD Update
```

## Component Interaction

```
+----------------+    renders    +----------------+
|                |-------------->|                |
|   GameScreen   |               |     Bubble     |
|                |<--------------|                |
+----------------+   position    +----------------+
      |      ^        updates
      |      |
      v      |
+----------------+
|                |
|  User Input    |
|  & Game State  |
|                |
+----------------+
```

## Assessment Criteria

Your implementation will be assessed based on:

1. **Functionality**: Does the gun move correctly and respond to user input?
2. **Code Quality**: Is your code well-structured, commented, and efficient?
3. **User Experience**: Is the game intuitive to play and visually appealing?
4. **Creativity**: Have you added unique features or enhancements beyond the basic requirements?
5. **Performance**: Does the game run smoothly without performance issues?

## Getting Started

1. Review the existing code in `GameScreen.js`, focusing on the areas marked with `STUDENT TASK` comments
2. Plan your approach for implementing each feature
3. Test your implementation frequently to ensure everything works as expected

## Tips

- Use React Native's touch handling capabilities for smooth gun control
- Consider using Animated API for smoother animations
- Remember to clean up any event listeners or timers you add
- Test on different device sizes to ensure your UI is responsive

## Submission

Submit your completed project by:
1. Pushing your code to your Git repository
2. Recording a 5-minute video explaining your implementation
3. Be prepared to demonstrate your game in class

Good luck and have fun enhancing the Bubble Popper game!
