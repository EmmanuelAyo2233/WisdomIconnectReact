# WisdomIconnect Platform

## Platform Overview

WisdomIconnect is a mentorship and knowledge‑sharing platform designed to connect experienced professionals (Mentors) with individuals seeking guidance (Mentees). The platform enables users to:

- Discover and explore mentors across various fields
- Book mentorship sessions with experienced professionals
- Communicate through an integrated messaging system
- Build long‑term professional relationships
- Share and learn through structured knowledge playbooks

## Platform User Roles

The system supports three primary user roles:

- **Admin** – Responsible for managing and moderating the platform.
- **Mentor** – Experienced professionals who provide mentorship sessions and share knowledge.
- **Mentee** – Individuals who search for mentors, book sessions, and learn from their guidance.

## Brand Identity

- **Primary Color:** `#b22222`
- **Secondary Colors:** White, Light Black (`#1f1f1f`)
- **Design Style:**
  - Tailwind CSS framework
  - Modern card‑based layout
  - Rounded corners
  - Soft shadows
  - Indigenous African imagery featured on the landing page

## Landing Page Structure

The landing page is divided into the following sections:

### Navbar

Navigation items include:

- Platform logo (WisdomIconnect)
- About Us
- Features
- Testimonial
- Our Blog
- Contact Us
- Login
- Sign Up

### Hero Section

- Background imagery representing indigenous African wisdom and culture.
- Content: A strong headline describing the platform’s purpose.
  - Example headline: “Connecting Generations Through Wisdom.”
- Call‑to‑Action Buttons:
  - Get Started
  - Become a Mentor

### About Us Section

Explains the mission and purpose of the platform.

### Features Section

**Title:** “Our Features & Services”

Example features:

- Discover mentors
- Book mentorship sessions
- Real‑time messaging
- Knowledge playbooks

### Testimonial Section

**Title:** “What People Are Saying”

Displays feedback and experiences from users.

### Blog Section

**Title:** “Insights and Stories From Our Elders”

Displays articles written by mentors.

### Contact Section

Contains a contact form for user inquiries.

### Footer

Includes:

- Quick Links
- Social Media Links
- Privacy Policy
- Copyright Information

## Authentication System

Users must choose how they want to register. The signup page presents two registration options:

- Register as Mentor
- Register as Mentee

## Mentor Registration

Mentor signup form fields include:

- Full Name \*
- Email Address \*
- Password \*
- Confirm Password \*
- Short Bio \*
- Expertise (dropdown with removable tags)
- Years of Experience
- LinkedIn URL

### Mentor Approval Process

After registration, every mentor account is assigned a status of **Pending**. The Admin reviews the mentor profile and may take one of the following actions:

- **Approve**
- **Reject**
- **Reconsider**

If Approved:

- Mentor gains access to:
  - Mentor Dashboard
  - Availability Management
  - Bookings
  - Messaging
  - Playbooks

If Rejected:

- Mentor privileges are removed.
- The user remains on the platform only as a mentee and loses access to the mentor dashboard.

The Admin may later reconsider and approve the mentor if necessary.

## Mentee Registration

Mentee signup form fields:

- Full Name \*
- Email Address \*
- Password \*
- Confirm Password

Mentee accounts are automatically approved upon registration.

## Dashboard Layout

All dashboards share a common layout consisting of:

- Sidebar Navigation
- Top Navigation Bar
- Main Content Area

### Top Navigation Bar

The top navigation bar is shared by both mentor and mentee dashboards. It contains:

- Platform logo (WisdomIconnect)
- Search bar for finding mentors
- Notification icon with alert badges
- Book Session icon

### Sidebar Profile Panel

At the bottom of the sidebar is the user's profile image. When clicked, it reveals the following options:

- View Profile
- Notifications
- Connect Calendar
- Settings
- Logout

### Mentor Dashboard Sidebar

Mentor navigation links include:

- Home
- Availability
- Messages
- Bookings
- Connections
- Playbooks

### Mentee Dashboard Sidebar

Mentee navigation links include:

- Home
- Explore
- Messages
- Bookings
- Connections
- Playbooks

**Key Difference:** Mentors have an “Availability” section, while mentees have an “Explore” section used to discover mentors.

## Mentor Dashboard (Home Page)

The mentor homepage contains several sections:

### Welcome Section

Example: “Welcome back, Dr. Ade.”

### Quick Action Cards

- Set Availability
- View Bookings
- Open Messages
- Create Playbook

### Playbooks Preview

Displays the 4–5 most recent playbooks.

### Profile Completion Card

Shows mentor profile completion percentage (e.g. “Profile Completion – 80%”).

### Calendar Reminder

Displays upcoming mentorship sessions.

### Recent Activities

Includes:

- New booking requests
- New connections
- Messages received

### Achievements and Badges

Examples:

- Top Mentor
- 100 Sessions Completed
- Highly Rated Mentor

## Mentee Dashboard (Home Page)

Sections on the mentee homepage include:

### Welcome Message

Example: “Welcome back, Sarah.”

### Quick Action Cards

- Explore Mentors
- View Bookings
- Messages
- Saved Mentors

### Recommended Mentors

Displays mentor cards suggested to the user.

### Recent Playbooks

Shows knowledge articles written by mentors.

### Upcoming Sessions

Displays scheduled mentorship sessions.

## Explore Mentors Page

Purpose: Allows mentees to discover and evaluate mentors.

### UI Structure

- Search Bar
- Filter Options
- Mentor Cards Grid

Filters may include:

- Expertise
- Years of Experience
- Availability
- Ratings

### Mentor Card Information

- Profile Image
- Mentor Name
- Expertise
- Years of Experience
- Rating
- View Profile Button

## Mentor Profile Page

This page allows mentees to view mentor details and book sessions.

### Sections Include:

- Profile Header
- About Mentor
- Qualifications
- Expertise
- Experience
- Playbooks
- Availability Calendar
- Book Session

### Availability Section

Displays available time slots created by the mentor. Example:

```
Monday – 10:00 AM – Career Advice [Book]
Wednesday – 1:00 PM – Business Mentorship [Book]
```

These time slots are generated from the mentor’s Availability page.

## Booking Logic

Booking flow:

1. Mentee visits a mentor profile.
2. Mentee views available time slots.
3. Mentee selects a slot and clicks “Book”.
4. A session is created.
5. The session appears in both dashboards.

## Connections Logic

Connections are automatically created after a mentorship session is completed.

Flow:

```
Mentee books mentor → Session is completed → System automatically adds both users to Connections
```

Connections allow users to:

- Message each other
- Book sessions faster
- View each other’s profiles

## Connections Page

Displays users who have previously had sessions together.

### Card Layout Includes:

- Avatar
- Name
- Expertise
- Message Button
- Book Again Button

## Messaging Page

Messaging interface layout:

### Left Panel:

- List of conversations
- User search
- Profile image
- Last message preview
- Timestamp
- Unread message badge

### Right Panel:

- Chat window
- Message history
- Message input field

## Bookings Page

Bookings are organized into tabs:

- Upcoming
- Pending
- Completed
- Cancelled

### Example booking card:

```
Mentor: Dr. Ade
Topic: Career Advice
Date: March 20
Time: 3:00 PM
```

Available actions:

- Join Session
- Reschedule
- Cancel

## Playbooks

Mentors can create educational knowledge articles called Playbooks.
Each playbook includes:

- Title
- Author
- Category
- Content
- Comments
- Likes

Playbooks allow mentors to share valuable insights beyond live sessions.

## Profile Management

Both mentors and mentees can edit their profiles.
Editable fields include:

- Profile Image
- Full Name
- Bio
- Expertise
- Experience
- LinkedIn
- Availability (mentors only)

Users access profile editing through:
`Sidebar Profile Menu → View Profile → Edit Profile`

## Admin Dashboard

The Admin dashboard allows platform management.
Admin capabilities include:

- Approving mentors
- Rejecting mentors
- Reconsidering rejected mentors
- Viewing users
- Managing bookings
- Managing playbooks
- Monitoring platform activity

## Final User Flow

**Mentor Flow**

```
Register → Admin Approval → Set Availability → Receive Bookings → Conduct Sessions → Build Connections
```

**Mentee Flow**

```
Register → Explore Mentors → View Mentor Profile → Book Session → Attend Session → Connection Created → Continue Messaging
```

This documentation provides a complete overview of the platform, including:

- Landing page structure
- Mentor and mentee dashboards
- Sidebar navigation
- Booking system
- Availability management
- Connection logic
- Messaging system
- Admin approval workflow
- Profile management
