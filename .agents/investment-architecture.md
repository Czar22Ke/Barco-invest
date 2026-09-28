# Investment Platform Architecture Constraints

**Core Stack:**
- Frontend: Vue 3 + Vite 
- Backend: Node.js Microservices
- Styling: Tailwind CSS / Custom CSS

**Directory Structure (Monorepo):**
- `/frontend`: Contains the Vue UI. Must be decoupled from the backend. Use `vue-router` with a Public Layout (marketing) and a Secure Dashboard Layout (auth required).
- `/backend`: Contains Node.js microservices (e.g., `auth-service`, `investment-engine`, `ledger-service`). 

**Execution Guidelines:**
- **No Templates:** Do not use off-the-shelf themes or builders. All code must be custom-built for institutional readiness.
- **Microservice Isolation:** When generating Node.js logic, ensure it does not contain or depend on frontend UI code.
- **Adapter Pattern:** The investment engine must use an Adapter Pattern for external exchange APIs so institutional clients can plug in their own liquidity pools later.
- **Risk Management Priority:** investment scripts must include user tiers mapped to preset fund allocations, High-Water Mark (HWM) logic to isolate profit + deposit for the various withdrawal commission, NAV calculation windows for withdrawal processing, and precise mathematical handling for profit distribution, commission deductions, and tax withholdings.
- **Tier & Allocation Logic:** System must strictly enforce tier definitions (Bronze, Silver, Gold, Institutional), pool ratio allocations, NAV calculation windows, and performance fee/tax deductions against the High-Water Mark.
