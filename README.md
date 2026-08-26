# WardRegistry 🏛️

**WardRegistry** is a web application designed for Panchayat administrators to log, track, and manage local ward demographics, family structures, citizen records, and public service requests.

---

## Key Features

* **Authentication System**: Secure email/password login for Panchayat officials (`auth.js`).
* **Dashboard Analytics**: Real-time statistics tracking total families, members, disabled citizens, senior citizens, students, and pensioners.
* **Zone Filtering**: Global zone selector (Zones 1–5) to isolate and view region-specific statistics and records.
* **Family & Member Management**:
  * Track household ownership status (`Owned` vs. `Rental`), house numbers, and addresses.
  * Register family members with detailed demographics (DOB, phone numbers, relations, occupations).
  * Tag special statuses: **Student**, **Senior Citizen (60+)**, **Disabled**, or **Pensioner** (with specific pension categories).
  * Maintain medical needs and special care notes for residents.
* **Queries & Reports**: Quick-filter options to generate demographic reports by status or custom occupation queries.
* **Panchayat Requests**: Track and manage citizen applications and requests with multi-state statuses (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`).

---

## Tech Stack

* **Frontend**: HTML5, CSS3 (Custom styling with Google Fonts: *Playfair Display* & *Work Sans*), Vanilla JavaScript.
* **Backend & Database**: Firebase Cloud Firestore (with offline persistence support).
* **Authentication**: Firebase Auth.

---

## File Structure

```text
├── index.html          # Main application structure & modals
├── styles.css          # Core app layout & responsive styles
├── auth.css            # Authentication screen styling
├── auth.js            # Firebase authentication handler
└── app-firebase.js     # Main application logic & Firestore integration
