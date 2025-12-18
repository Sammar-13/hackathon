/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a set of docs in a dedicated sidebar
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // But you can create a sidebar manually
  bookSidebar: [
    {
      type: 'category',
      label: '📚 Physical AI & Robotics Book',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: '🤖 Chapter 1: Introduction to Physical AI',
          collapsed: false,
          items: [
            {
              type: 'doc',
              id: '01-introduction',
              label: 'Read Chapter',
            },
            {
              type: 'html',
              value: '<span style="color: #888; font-size: 0.9em; margin-left: 10px;">Topics: What is Physical AI? | Components | History | Applications | Challenges</span>',
            },
          ],
        },
        {
          type: 'category',
          label: '🔧 Chapter 2: ROS 2 Fundamentals',
          collapsed: false,
          items: [
            {
              type: 'doc',
              id: '02-ros2-fundamentals',
              label: 'Read Chapter',
            },
            {
              type: 'html',
              value: '<span style="color: #888; font-size: 0.9em; margin-left: 10px;">Topics: Nodes | Topics | Services | Actions | Workspace Setup | Best Practices</span>',
            },
          ],
        },
        {
          type: 'category',
          label: '🌐 Chapter 3: Gazebo Simulation',
          collapsed: false,
          items: [
            {
              type: 'doc',
              id: '03-gazebo-simulation',
              label: 'Read Chapter',
            },
            {
              type: 'html',
              value: '<span style="color: #888; font-size: 0.9em; margin-left: 10px;">Topics: Why Simulation? | World & Models | URDF Format | Sensors | ROS 2 Integration</span>',
            },
          ],
        },
        {
          type: 'category',
          label: '🚀 Chapter 4: NVIDIA Isaac Platform',
          collapsed: false,
          items: [
            {
              type: 'doc',
              id: '04-nvidia-isaac',
              label: 'Read Chapter',
            },
            {
              type: 'html',
              value: '<span style="color: #888; font-size: 0.9em; margin-left: 10px;">Topics: Isaac Sim | Perception | Navigation | Manipulation | Domain Randomization</span>',
            },
          ],
        },
        {
          type: 'category',
          label: '🧠 Chapter 5: Vision-Language-Action Models',
          collapsed: false,
          items: [
            {
              type: 'doc',
              id: '05-vision-language-action',
              label: 'Read Chapter',
            },
            {
              type: 'html',
              value: '<span style="color: #888; font-size: 0.9em; margin-left: 10px;">Topics: VLA Architecture | Training | Applications | Challenges | Real-world Deployment</span>',
            },
          ],
        },
        {
          type: 'category',
          label: '🎯 Chapter 6: Capstone Project',
          collapsed: false,
          items: [
            {
              type: 'doc',
              id: '06-capstone-project',
              label: 'Read Chapter',
            },
            {
              type: 'html',
              value: '<span style="color: #888; font-size: 0.9em; margin-left: 10px;">Topics: End-to-End System | Perception | Planning | Control | Testing & Evaluation</span>',
            },
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;
