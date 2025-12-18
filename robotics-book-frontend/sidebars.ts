import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
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
              id: 'introduction',
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
              id: 'ros2-fundamentals',
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
              id: 'gazebo-simulation',
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
              id: 'nvidia-isaac',
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
              id: 'vision-language-action',
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
              id: 'capstone-project',
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

export default sidebars;
