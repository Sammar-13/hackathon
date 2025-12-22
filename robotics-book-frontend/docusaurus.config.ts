import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '🤖 Physical AI & Humanoid Robotics',
  tagline: 'Build Intelligent Robots with ROS 2, Simulation, and AI',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: ['@docusaurus/theme-mermaid'],

  plugins: [
    // Proxy Plugin for Local Development
    () => ({
      name: 'configure-proxy',
      configureWebpack() {
        return {
          devServer: {
            proxy: [
              {
                context: ['/api'],
                target: 'http://localhost:3001',
                secure: false,
                changeOrigin: true,
              },
            ],
          },
        };
      },
    }),
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '🤖 Robotics Book',
      logo: {
        alt: 'Robotics Book Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'bookSidebar',
          position: 'left',
          label: '📚 Read Book',
        },
        {
          href: 'https://github.com',
          label: '⭐ GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '📚 Book',
          items: [
            {
              label: 'Start Reading',
              to: '/docs/intro',
            },
            {
              label: 'All Chapters',
              to: '/docs/introduction',
            },
          ],
        },
        {
          title: '🔗 Resources',
          items: [
            {
              label: 'ROS 2 Official',
              href: 'https://docs.ros.org/en/humble/',
            },
            {
              label: 'NVIDIA Isaac',
              href: 'https://developer.nvidia.com/isaac',
            },
            {
              label: 'Gazebo',
              href: 'https://gazebosim.org/',
            },
          ],
        },
        {
          title: '💻 Source',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Robotics Course. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
