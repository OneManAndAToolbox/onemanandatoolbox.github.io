# GALLERY WORKFLOW V2 (Simplified 5-Bucket System)

This document provides the definitive steps for adding new projects to the **One Man and a Toolbox** gallery.

## STEP 1: PREPARE IMAGES
1.  Standardize filenames: `[category]_[project_name]([sequence_number]).webp` (e.g., `general_lock_repair(1).webp`).
2.  **No spaces in filenames.**
3.  Place images in the corresponding folder in `public/images/`:
    *   `/general/` - Repairs, Small Jobs, Assembly, Locks, Cat Flaps.
    *   `/plumbing/` - Taps, Toilets, Sinks, Waste Pipes.
    *   `/electrical/` - Sockets, Lights, Dimmers, Smart Home.
    *   `/carpentry/` - Bespoke Wood Builds (Ramps, Sheds, Custom Units).
    *   `/garden/` - Maintenance, Fencing, Decking, Planters.

## STEP 2: UPDATE THE MASTER CSV
1.  Open `project_gallery_final_master.csv`.
2.  Add a new row with your Project details.
3.  Ensure the `work_type` exactly matches one of the five buckets above.

## STEP 3: UPDATE app/page.js
### 1. Add Dropdown Option
*   Locate the `<ul className="custom-select-options">` for your category.
*   Add a new `<li>` entry in chronological order (Newest first).
*   Assign the next available `general-job-X`, `garden-job-X`, etc.

### 2. Add Job Panel
*   Locate the `<div className="job-panels-container">` for your category.
*   Add a new `<div className="job-panel">` matching the Job ID you assigned.
*   Use `${basePath}images/[folder]/...` for image paths.

## STEP 4: VERIFY
*   Start the local dev server: `npm run dev`.
*   Check the gallery to ensure the images load and the carousel resets correctly when selected.
