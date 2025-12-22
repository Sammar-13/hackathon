---
sidebar_position: 6
id: capstone-project
---

# Capstone Project: Building an End-to-End Robotics System

## Project Overview

In this capstone, you'll build a complete autonomous manipulation system that integrates all the concepts from the previous chapters. The system will include:
- **Perception**: Object detection and pose estimation
- **Planning**: Task planning and motion planning
- **Control**: Robotic arm manipulation
- **Integration**: All components working together

## System Architecture

```
┌─────────────────┐
│   Camera Feed   │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│   Perception Pipeline    │
│  (Detection + Tracking)  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│   Task Planning          │
│  (What to pick up)       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│   Motion Planning        │
│  (How to reach it)       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│   Robot Control          │
│  (Execute movement)      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│    Robot Hardware        │
│   (Manipulator Arm)      │
└──────────────────────────┘
```

## Part 1: Setup

### Required Hardware
- Robotic manipulator (e.g., UR5e, Franka Panda, or simulated)
- RGBD camera (e.g., RealSense D435)
- Computing platform (Jetson or high-end GPU)
- ROS 2 installation

### Environment Setup

```bash
# Create workspace
mkdir -p capstone_ws/src
cd capstone_ws

# Clone required packages
git clone https://github.com/ros-planning/moveit2 src/moveit2

# Install dependencies
rosdep install --from-paths src --ignore-src -r -y

# Build
colcon build
source install/setup.bash
```

## Part 2: Perception Pipeline

### Object Detection

```python
# detection_node.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from vision_msgs.msg import Detection2DArray
from cv_bridge import CvBridge
import cv2
from ultralytics import YOLO

class DetectionNode(Node):
    def __init__(self):
        super().__init__('detection_node')

        # Load pre-trained model
        self.model = YOLO("yolov8n.pt")
        self.bridge = CvBridge()

        # Create subscribers and publishers
        self.camera_sub = self.create_subscription(
            Image, '/camera/color/image_raw',
            self.image_callback, 10)

        self.detection_pub = self.create_publisher(
            Detection2DArray, '/detections', 10)

    def image_callback(self, msg):
        # Convert ROS message to OpenCV format
        cv_image = self.bridge.imgmsg_to_cv2(msg, "bgr8")

        # Run detection
        results = self.model(cv_image)

        # Convert to ROS message
        detections = Detection2DArray()

        for detection in results[0].boxes:
            bbox = detection.xyxy[0].cpu().numpy()
            conf = detection.conf.cpu().numpy()[0]
            cls = int(detection.cls.cpu().numpy()[0])

            # Create detection object
            det_msg = Detection2D()
            det_msg.bbox.center.x = (bbox[0] + bbox[2]) / 2
            det_msg.bbox.center.y = (bbox[1] + bbox[3]) / 2
            det_msg.bbox.size_x = bbox[2] - bbox[0]
            det_msg.bbox.size_y = bbox[3] - bbox[1]

            detections.detections.append(det_msg)

        self.detection_pub.publish(detections)

def main():
    rclpy.init()
    node = DetectionNode()
    rclpy.spin(node)

if __name__ == '__main__':
    main()
```

## Part 3: Motion Planning

Using MoveIt 2 for motion planning:

```python
# manipulation_node.py
from moveit_commander import MoveGroupCommander, PlanningSceneInterface
from geometry_msgs.msg import Pose

class ManipulationNode(Node):
    def __init__(self):
        super().__init__('manipulation_node')

        self.move_group = MoveGroupCommander("panda_arm")
        self.planning_scene = PlanningSceneInterface()

        self.pose_sub = self.create_subscription(
            PoseArray, '/object_poses',
            self.pose_callback, 10)

    def pose_callback(self, msg):
        if not msg.poses:
            return

        # Get first detected object
        target_pose = msg.poses[0]

        # Add offset for gripper
        target_pose.position.z += 0.1  # Approach from above

        # Plan motion
        self.move_group.set_pose_target(target_pose)
        plan = self.move_group.plan()

        # Execute plan
        if plan[0]:
            self.move_group.execute(plan[1], wait=True)
        else:
            self.get_logger().error("Planning failed")
```

## Part 4: Complete Integration

```python
# capstone_system.py
def main():
    rclpy.init()

    # Create executor
    executor = MultiThreadedExecutor()

    # Add nodes
    detection_node = DetectionNode()
    pose_estimation_node = PoseEstimationNode()
    manipulation_node = ManipulationNode()

    executor.add_node(detection_node)
    executor.add_node(pose_estimation_node)
    executor.add_node(manipulation_node)

    # Spin
    executor.spin()

    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Part 5: Testing and Evaluation

### Unit Tests

```python
# test_detection.py
import pytest
import cv2
from detection_node import DetectionNode

def test_detection_on_sample():
    node = DetectionNode()

    # Load sample image
    image = cv2.imread('test_image.jpg')

    # Run detection
    detections = node.detect(image)

    # Verify results
    assert len(detections) > 0
    assert detections[0]['confidence'] > 0.5
```

## Conclusion

This capstone project demonstrates:
- **Perception**: Detecting and locating objects
- **Planning**: Computing safe, efficient trajectories
- **Control**: Executing complex manipulation tasks
- **Integration**: Bringing all systems together

The skills learned here form the foundation for real-world robotics applications. Future enhancements could include:
- Learning from demonstration
- Multi-object manipulation
- Adaptive control based on sensor feedback
- Deployment to mobile platforms

## Key Takeaways

- End-to-end robotic systems require integration of many components
- Simulation is crucial for development and testing
- Modular design with ROS 2 enables rapid prototyping
- Perception and control must work together seamlessly
- Careful testing ensures reliable operation

Congratulations on completing the course! You now have the foundational knowledge to build sophisticated robotic systems.
