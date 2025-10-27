# ParāSara-X - Professional Vedic Astrology Intelligence Platform

### Overview
ParāSara-X is a professional Vedic astrology intelligence platform designed to offer an expert consultation interface with Sage Parashara. It integrates advanced astronomical calculations with an intuitive Q&A experience to deliver personalized astrological insights. The platform aims to provide the precision of professional desktop software in a modern, premium interface, focusing on comprehensive birth chart analysis, Dasha system predictions, advanced astrological analysis, and remedial measures. It targets a market for comprehensive, high-accuracy Vedic astrology services.

### User Preferences
- **Design Aesthetic**: Premium, professional appearance; Dark theme with cosmic/celestial feel; Golden accents for sacred/divine associations; Clean, readable layouts with proper information hierarchy.
- **Calculation Philosophy**: Prioritize accuracy for ascendant and houses (most critical); Accept reasonable approximations for planetary longitudes in MVP; Maintain fully client-side architecture (no server dependencies); Follow classical Vedic astrology traditions.

### System Architecture
The platform features an Expert Intelligence Interface for professional Q&A consultation, aiming for Parashara's Light 9 precision. It utilizes a single-axis interaction model with a central input bar for birth details and text queries, set against a dark cosmos theme with sacred geometry, gold accents, and cosmic animations.

#### UI/UX Decisions
- **Interface**: Professional consultation platform with a Sage Parashara avatar, professional header, and central input bar.
- **Response Panels**: Elegant markdown-supported panels for astrological insights.
- **Visuals**: Cosmic background (dark blue with twinkling stars, zodiac wheel), circular charts in Parashara's Light 9 style with a three-ring layout, gradient backgrounds, and golden accents.
- **Animations**: Fade-in, pulse, and spin effects.

#### Technical Implementations & Feature Specifications
- **Precise Calculations**: Lahiri Ayanamsa, sub-arcsecond accuracy for Ascendant, Whole Sign house system.
- **Divisional Charts**: All 16 Vargas (D1-D60) using classical BPHS formulas.
- **Dasha System**: 5-level Vimshottari Dasha hierarchy with timeline visualization.
- **Ashtakavarga**: Classical system including Binnashtakavarga, Sarvashtakavarga, Prastara, Trikona Shodhana, Ekadhipatya Shodhana, Kakshya Lords, Shodhita Ashtakavarga, and Divisional Ashtakavarga for all 16 charts.
- **Advanced Analysis**: Yoga Detection (312+ Yogas including Nabhasa, Lunar, Solar, Raja, Dhana, Parivartana, Mahapurusha, Conjunction, Bhava, and Arishta Yogas), Shadbala Strength, Transit Analysis (Sade Sati, Ashtama Shani), Advanced Aspects (Drishti), Dasha-Transit Blending, Varṣaphala (Solar Return).
- **Remedial Measures**: Gemstone, Mantra, Behavioral, Charity & Fasting, Color Therapy recommendations.
- **Professional Features**: PDF Report Generation, City Autocomplete, Data Validation.

#### System Design Choices
- **Technology Stack**: React 18, TypeScript, Vite, Wouter, TanStack Query, Tailwind CSS, shadcn/ui.
- **Backend**: Express server (port 5000) serving both API and frontend.
- **PDF Export**: jsPDF + html2canvas.
- **Storage**: PostgreSQL (Neon-backed) via Drizzle ORM.
- **Calculation Core**: Dedicated modules for astronomical computations, dasha, divisional charts, yoga detection, transits, shadbala, drishti, and ashtakavarga.
- **Project Structure**: Modular architecture with logic in `lib/`, views in `pages/`, UI components in `components/`, schemas in `shared/`, and backend in `server/`.
- **Yoga System Architecture**: 3-layer modular design: Helpers, Data (yoga definitions with BPHS citations), and an Engine for data-driven detection logic.

### External Dependencies
- **jsPDF**: For generating PDF reports.
- **html2canvas**: For converting HTML to canvas for PDF export.
- **shadcn/ui**: Component library.
- **Tailwind CSS**: For styling.
- **Zod**: For schema validation.
- **TanStack Query**: For state management.
- **Wouter**: For routing.
- **Vite**: Frontend build tool.
- **Express**: Backend server framework.
- **Drizzle ORM**: Database ORM for PostgreSQL.
- **PostgreSQL (Neon-backed)**: Database.
- **Astronomy Engine**: For precise astronomical calculations.

### Replit Environment Setup
- **Development**: Run `npm run dev` to start the development server on port 5000
- **Build**: Run `npm run build` to build the production bundle
- **Production**: Run `npm run start` to start the production server
- **Port Configuration**: Both frontend and backend run on port 5000 (Express serves Vite in dev mode)
- **Host Configuration**: Vite is configured with `host: "0.0.0.0"` and `allowedHosts: true` for Replit proxy compatibility
- **Storage**: Currently using MemStorage (in-memory) for user data - can be switched to PostgreSQL if needed
- **Deployment**: Configured for Autoscale deployment with build and start commands