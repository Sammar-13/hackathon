---
sidebar_position: 2
id: ros2-fundamentals
---

# ROS 2 Fundamentals

## Introduction

ROS 2 (Robot Operating System 2) is the industry-standard middleware for building robotic applications. It provides the tools and libraries necessary for building complex multi-robot systems with clean architecture and strong communication patterns.

## What is ROS 2?

ROS 2 is a flexible framework for writing robot software. It's a collection of tools, libraries, and conventions that aim to simplify the task of creating complex and robust robot behavior across many platforms.

### Key Advantages
- **Modularity**: Decoupled architecture with independent components
- **Reusability**: Leverage existing packages and community contributions
- **Scalability**: Build systems from small single robots to complex multi-robot teams
- **Standards-based**: Uses DDS (Data Distribution Service) for communication

## Core Concepts

### Nodes
A node is a ROS program that performs computation. Nodes communicate with each other via ROS communication mechanisms.

### Topics
Topics are named buses over which nodes exchange messages. A node may publish data to any number of topics and simultaneously have subscriptions to many topics.

### Services
Services are a way to do synchronous request-response communication between nodes. Useful when you need a response immediately.

### Actions
Actions are for long-running tasks where feedback is needed. Unlike services, which are blocking, actions are non-blocking and can be cancelled.

## Message Types

ROS uses strongly-typed messages for communication. Common message types include:

- **String**: Text data
- **Int32, Float64**: Numeric types
- **Twist**: Velocity command (linear and angular)
- **Pose**: Position and orientation in 3D space
- **Image**: Camera image data
- **LaserScan**: Data from a 2D lidar sensor

## Workspace Setup

A typical ROS 2 workspace structure:

```
workspace/
├── src/
│   ├── package1/
│   │   ├── package.xml
│   │   ├── CMakeLists.txt
│   │   └── src/
│   └── package2/
├── build/
├── install/
└── log/
```

### Building Your Workspace

```bash
cd workspace
colcon build
source install/setup.bash
```

## Writing a Simple Robot Program

Here's a basic program that subscribes to sensor data and publishes commands:

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan

class SimpleRobot(Node):
    def __init__(self):
        super().__init__('simple_robot')
        self.subscription = self.create_subscription(
            LaserScan, 'scan', self.scan_callback, 10)
        self.publisher = self.create_publisher(Twist, 'cmd_vel', 10)

    def scan_callback(self, msg):
        if min(msg.ranges) > 0.5:
            twist = Twist()
            twist.linear.x = 0.1
            self.publisher.publish(twist)
        else:
            twist = Twist()
            twist.angular.z = 1.0
            self.publisher.publish(twist)

def main(args=None):
    rclpy.init(args=args)
    robot = SimpleRobot()
    rclpy.spin(robot)

if __name__ == '__main__':
    main()
```

## Best Practices

1. **Use meaningful names**: Node and topic names should clearly indicate purpose
2. **Handle parameters**: Make your nodes configurable through parameters
3. **Error handling**: Always handle exceptions and edge cases
4. **Documentation**: Document your nodes, topics, and expected message formats
5. **Testing**: Write unit tests for your node logic

## Tools and Debugging

### ros2 node list
List all active nodes in the system

### ros2 topic echo
Monitor messages on a specific topic in real-time

### ros2 bag
Record and playback topic data for offline analysis

## Key Takeaways

- ROS 2 provides a modular, scalable framework for robot software
- Nodes communicate via topics, services, and actions
- Strong typing in messages ensures robust inter-node communication
- The ROS ecosystem provides thousands of reusable packages
