import { ModuleItem } from '../types';

export const INITIAL_MODULES: ModuleItem[] = [
  {
    id: 'd9-escape-from-tarkov',
    name: 'ESCAPE FROM TARKOV',
    game: 'Escape from Tarkov',
    tagline: 'Dual Engine PvE & PvP | Item Database | Zero-Disk Stream',
    description: 'Target Module: EscapeFromTarkov.exe (Unity 2022.3). High-performance kernel-isolated tactical overlay featuring live item valuations, sub-millisecond zeroing ballistic computation, and zero-disk streaming memory architecture.',
    version: 'Unity 2022.3',
    status: 'Operational',
    coverImage: '/src/assets/images/eft_tactical_operator_1795141443957.jpg',
    tiers: {
      '1_week': {
        id: '1_week',
        name: 'Weekly Operational Pass',
        durationLabel: '7 Days Access',
        price: 14.99,
        maxSlots: 10,
        claimedSlots: 2,
        perks: [
          'Full D9Assist EFT tactical suite active',
          'Zero-Disk memory injection pipeline',
          'Hourly community offset sync',
          'Dual Engine PvE & PvP support',
          'Instant hardware-ID reset (1x)'
        ]
      },
      '1_month': {
        id: '1_month',
        name: 'Monthly Tactical Access',
        durationLabel: '30 Days Access',
        price: 34.99,
        maxSlots: 10,
        claimedSlots: 3,
        recommended: true,
        perks: [
          'Full D9Assist EFT tactical suite active',
          'Priority private cluster slots',
          'Dual Engine PvE & PvP support',
          'Dynamic Flea Market container scanner',
          'Unlimited HWID reassignment',
          'Encrypted Discord VIP clearance'
        ]
      },
      '1_year': {
        id: '1_year',
        name: 'Annual Master License',
        durationLabel: '365 Days Access',
        price: 114.99,
        maxSlots: 10,
        claimedSlots: 4,
        perks: [
          'All current & upcoming D9Assist EFT modules',
          'Includes Escape from Tarkov: Arena build',
          'Direct developer hotline access',
          'Permanent slot guarantee against cap',
          'Zero queue verification clearance'
        ]
      }
    },
    media: [
      {
        id: 'd9-media-library-client',
        type: 'image',
        url: '/public/assets/aistudio/Screenshot_2026-11-19_102312_aad40270.png',
        title: 'D9Assist // Game Library Client',
        caption: 'Active verified session showing library deployment for Escape from Tarkov, Arena, and Custom Target SDK Harness.',
        aspectRatio: '4:3',
        tag: 'D9 Launcher UI'
      },
      {
        id: 'd9-media-launcher-auth',
        type: 'image',
        url: '/public/assets/aistudio/Screenshot_2026-11-19_075200_4265a8c2.png',
        title: 'D9Assist // Launcher v2.0 - Secure Memory',
        caption: 'Cryptographic activation code redemption and account binding handshake interface.',
        aspectRatio: '4:3',
        tag: 'Auth System'
      },
      {
        id: 'eft-media-1',
        type: 'image',
        url: '/src/assets/images/eft_tactical_operator_1795141443957.jpg',
        title: 'Factory Infiltration & Tactical Stance',
        caption: 'Field operation with D9Assist HUD active across low-visibility night and dusk raid environments.',
        aspectRatio: '16:9',
        tag: 'In-Raid Deployment'
      },
      {
        id: 'eft-media-2',
        type: 'image',
        url: '/src/assets/images/eft_ballistics_telemetry_1795141445918.jpg',
        title: 'MD-3000 Ballistics & Trajectory Overlay',
        caption: 'Sub-millimeter zeroing curve calculations accounting for bullet velocity, air drag, and barrel elevation.',
        aspectRatio: '4:3',
        tag: 'Ballistics Telemetry'
      },
      {
        id: 'eft-media-3',
        type: 'image',
        url: '/src/assets/images/eft_armory_workbench_1795141445483.jpg',
        title: 'Gunsmith Workbench & Recoil Profiling',
        caption: 'Automated modular weapon builder calculating recoil drift, ergonomics balance, and suppressor heat signature.',
        aspectRatio: '4:3',
        tag: 'Weapon Optimizer'
      },
      {
        id: 'eft-media-4',
        type: 'image',
        url: '/src/assets/images/eft_extraction_intel_1795141445248.jpg',
        title: 'Topographic Satellite & Exfil Telemetry',
        caption: 'Real-time extraction point availability, countdown timers, sniper scav perimeters, and scav boss alerts.',
        aspectRatio: '4:3',
        tag: 'Exfil Intel'
      },
      {
        id: 'eft-media-5',
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        title: 'Live Target Acquisition & Sweep Demo',
        caption: 'Demonstration of situational tactical telemetry with low-latency rendering and minimal CPU overhead.',
        aspectRatio: '16:9',
        tag: 'Video Clip'
      }
    ],
    features: [
      {
        title: 'Dual Engine PvE & PvP Architecture',
        desc: 'Seamless compatibility across both Escape from Tarkov official raids and standalone PvE offline practices.'
      },
      {
        title: 'Zero-Disk Streaming Memory',
        desc: 'Module code streams directly into secured volatile memory with zero persistent trace written to local disk.'
      },
      {
        title: 'Dynamic Flea Market & Loot Indexer',
        desc: 'Calculates high-tier container valuations, keycard prices, and quest item locations with custom visual filters.'
      },
      {
        title: 'Sub-Millimeter Ballistics Telemetry',
        desc: 'Instant trajectory zeroing accounting for muzzle velocity, bullet caliber drag coefficients, and elevation angles.'
      }
    ],
    requirements: [
      { label: 'Target Module', value: 'EscapeFromTarkov.exe (Unity 2022.3)' },
      { label: 'Operating System', value: 'Windows 10 / 11 64-bit' },
      { label: 'Security Layer', value: 'Ring-0 isolated with zero-disk stream' },
      { label: 'Memory Allocation', value: '16 GB RAM minimum' }
    ],
    changelog: [
      {
        version: 'v2.0 - SECURE MEMORY',
        date: 'November 2026',
        items: [
          'Aligned with D9Assist v2.0 secure memory architecture',
          'Configured 10 weekly ($14.99), 10 monthly ($34.99), and 10 annual ($114.99) hard-capped slots',
          'Integrated zero-disk memory stream verification'
        ]
      }
    ],
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'd9-tarkov-arena',
    name: 'ESCAPE FROM TARKOV: ARENA',
    game: 'Escape from Tarkov: Arena',
    tagline: 'Fast-Paced CQB Memory Scanner | Player Health | Radar',
    description: 'Target Module: EscapeFromTarkov.exe (Arena Matchmaking). Engineered for high-tick competitive arena deathmatch and shootout matches with instant player health telemetry, spatial sound radar, and round-start weapon loadout stats.',
    version: 'Arena v0.2.1',
    status: 'Updating',
    coverImage: '/public/assets/aistudio/Screenshot_2026-11-19_102312_aad40270.png',
    tiers: {
      '1_week': {
        id: '1_week',
        name: 'Weekly Operational Pass',
        durationLabel: '7 Days Access',
        price: 14.99,
        maxSlots: 10,
        claimedSlots: 1,
        perks: [
          'Full D9Assist Arena tactical module',
          'Fast-Paced CQB Memory Scanner',
          'Real-time enemy health indicators',
          'Round-start radar overlay'
        ]
      },
      '1_month': {
        id: '1_month',
        name: 'Monthly Tactical Access',
        durationLabel: '30 Days Access',
        price: 34.99,
        maxSlots: 10,
        claimedSlots: 2,
        recommended: true,
        perks: [
          'Full D9Assist Arena tactical module',
          'Priority private cluster slot',
          'Tournament mode stream-proof overlay',
          'Unlimited HWID reassignment'
        ]
      },
      '1_year': {
        id: '1_year',
        name: 'Annual Master License',
        durationLabel: '365 Days Access',
        price: 114.99,
        maxSlots: 10,
        claimedSlots: 2,
        perks: [
          'All current & upcoming D9Assist Arena modules',
          'Permanent slot guarantee against cap',
          'Exclusive low-contention private build'
        ]
      }
    },
    media: [
      {
        id: 'd9-arena-media-1',
        type: 'image',
        url: '/public/assets/aistudio/Screenshot_2026-11-19_102312_aad40270.png',
        title: 'D9Assist Arena Library Card',
        caption: 'Escape from Tarkov Arena registered in the D9Assist Game Library with verified active session.',
        aspectRatio: '4:3',
        tag: 'D9 Library'
      }
    ],
    features: [
      {
        title: 'Fast-Paced CQB Memory Scanner',
        desc: 'Optimized specifically for high round-frequency arena maps (Equator, Bowl, Air Pit, Sawmill, Chop Shop).'
      },
      {
        title: 'Live Player Health & Armor Durability',
        desc: 'Displays accurate enemy thorax, head, and limb damage telemetry in real-time.'
      }
    ],
    requirements: [
      { label: 'Target Module', value: 'EscapeFromTarkov.exe (Arena Matchmaking)' },
      { label: 'Operating System', value: 'Windows 10 / 11 64-bit' }
    ],
    changelog: [
      {
        version: 'Arena v0.2.1',
        date: 'November 2026',
        items: ['Initial Arena profile release with 10 slots per tier']
      }
    ],
    createdAt: Date.now() - 86400000 * 3
  }
];
