---
sidebar_position: 3
id: gazebo-simulation
---

# Gazebo Simulation

## Introduction

Gazebo is a powerful open-source 3D robotics simulation environment. It enables the simulation of robots and environments with realistic physics, sensors, and actuators—all without requiring expensive hardware.

## Why Simulation?

Simulation is critical in robotics development because:
- **Cost**: Testing on expensive hardware is risky and wasteful
- **Iteration Speed**: Try thousands of configurations in days instead of months
- **Safety**: Test dangerous behaviors in a safe virtual environment
- **Reproducibility**: Perfectly controlled test conditions
- **Accessibility**: Anyone can experiment with any robot, anywhere

## Getting Started with Gazebo

### Installation

```bash
# Ubuntu installation
sudo apt-get update
sudo apt-get install ros-humble-gazebo-ros-pkgs ros-humble-gazebo-ros

# Verify installation
gazebo --version
```

### Running Your First Simulation

```bash
# Launch empty world
gazebo

# Or from ROS with standard world
ros2 launch gazebo_ros gazebo.launch.py world:=worlds/empty.world
```

## Key Concepts

### World
A world is the top-level container in Gazebo. It contains all models, physics parameters, and environmental settings.

### Models
Models represent robots or objects in the simulation. They are defined in URDF (Unified Robot Description Format) or SDF (Simulation Description Format) files.

### Physics Engine
Gazebo uses ODE (Open Dynamics Engine) by default for physics simulation, supporting gravity, friction, and collision detection.

## URDF: Unified Robot Description Format

URDF is an XML format for describing robots. Here's a simple example:

```xml
<?xml version="1.0" ?>
<robot name="simple_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <cylinder length="0.6" radius="0.3"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.6" radius="0.3"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10.0"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
  </link>
</robot>
```

## Sensors in Gazebo

### Camera Sensor

```xml
<sensor name="camera" type="camera">
  <visualize>true</visualize>
  <update_rate>30</update_rate>
  <camera>
    <horizontal_fov>1.047</horizontal_fov>
    <image>
      <width>640</width>
      <height>480</height>
    </image>
    <clip>
      <near>0.1</near>
      <far>100</far>
    </clip>
  </camera>
</sensor>
```

### Lidar Sensor

```xml
<sensor name="lidar" type="ray">
  <visualize>false</visualize>
  <update_rate>10</update_rate>
  <ray>
    <scan>
      <horizontal>
        <samples>360</samples>
        <resolution>1</resolution>
        <min_angle>-3.14159</min_angle>
        <max_angle>3.14159</max_angle>
      </horizontal>
    </scan>
    <range>
      <min>0.08</min>
      <max>30.0</max>
      <resolution>0.01</resolution>
    </range>
  </ray>
</sensor>
```

## Running Simulations with ROS 2

To bridge Gazebo with ROS 2:

```bash
ros2 launch gazebo_ros gazebo.launch.py

# In another terminal, spawn your robot
ros2 launch my_robot spawn_robot.launch.py

# Control the robot
ros2 topic pub /cmd_vel geometry_msgs/Twist "{linear: {x: 0.1}, angular: {z: 0.0}}"

# Visualize with RViz
rviz2 -d my_robot.rviz
```

## Best Practices

1. **Start Simple**: Build and test simple models before complex ones
2. **Verify Physics**: Ensure physical properties match reality
3. **Use Realistic Sensor Noise**: Add noise to sensor data for realistic testing
4. **Profile Performance**: Monitor real-time factor to ensure adequate performance
5. **Version Control**: Keep URDF/SDF files in version control

## Key Takeaways

- Gazebo enables safe, repeatable testing of robot algorithms
- URDF and SDF formats describe robot structure and simulation parameters
- Integration with ROS 2 allows testing of ROS applications
- Simulation accelerates development and reduces costs
