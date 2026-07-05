# Chronos Moments API Reference

This document provides a comprehensive list of all active API endpoints available in the Chronos Moments MERN portfolio backend.

---

## 1. Consolidated Content Sections (`/api/content`)
*Manages dynamic sections like Story, Home, and About within a unified schema.*
- **GET** `/api/content?section=<story|home|about>` (Public)
  - Fetches details for the specified section. Returns single object for `home`/`about` or a list of items for `story`.
- **GET** `/api/content/admin/all?section=<story|home|about>` (Admin)
  - Lists all documents under the specified section, sorted by creation date.
- **POST** `/api/content` (Admin)
  - Creates a new story section or upserts/updates the single document for `home`/`about`.
- **PUT** `/api/content/:id` (Admin)
  - Updates fields in the content document's nested data store by ID.
- **DELETE** `/api/content/:id` (Admin)
  - Deletes a content document by ID.

---

## 2. Admin Security & Profile (`/api/admins`)
*Handles credentials and profile details of administrators.*
- **PATCH** `/api/admins/:id` (Admin)
  - Updates own administrator profile information (username, name, email, phone).
- **POST** `/api/admins/:id/change-password` (Admin)
  - Rotates administrator password. Requires providing the current password.

---

## 3. Dashboard Statistics (`/api/dashboard`)
*Aggregates summaries across operational metrics.*
- **GET** `/api/dashboard/stats` (Admin)
  - Returns count statistics: `totalBookings`, `pendingBookings`, and `totalPackages`.

---

## 4. Packages and Pricing (`/api/packages`)
*Stores booking offerings.*
- **GET** `/api/packages` (Public)
  - Lists active packages. Supports query filters: `category=<name>` and `status=<active|inactive>`.
- **GET** `/api/packages/admin/all` (Admin)
  - Lists all packages including inactive ones.
- **POST** `/api/packages` (Admin)
  - Creates a new package.
- **PUT** `/api/packages/:id` (Admin)
  - Updates package info.
- **DELETE** `/api/packages/:id` (Admin)
  - Removes a package.

---

## 5. Hero Slider (`/api/hero`)
*Manages active banner background slide carousels on the home view.*
- **GET** `/api/hero` (Public)
  - Fetches the active list of slider backgrounds.
- **GET** `/api/hero/admin/all` (Admin)
  - Fetches all hero background slides.
- **POST** `/api/hero` (Admin)
  - Creates a slide.
- **PUT** `/api/hero/:id` (Admin)
  - Edits slide details (title, subtitle, Cloudinary image, order, visibility status).
- **DELETE** `/api/hero/:id` (Admin)
  - Removes a hero slide.

---

## 6. Video Highlights (`/api/videos`)
*Manages cinematography reels and YouTube embed links (supporting description metadata).*
- **GET** `/api/videos` (Public)
  - Returns the list of cinematography reels.
- **POST** `/api/videos` (Admin)
  - Saves a new highlights video.
- **PUT** `/api/videos/:id` (Admin)
  - Updates video title, order, embed URL, or description.
- **DELETE** `/api/videos/:id` (Admin)
  - Deletes a highlights video.

---

## 7. User Bookings (`/api/bookings`)
*Manages client session reservations.*
- **POST** `/api/bookings` (Public / Optional Auth)
  - Requests a booking session reservation.
- **GET** `/api/bookings` (Admin)
  - Lists all reservations.
- **PATCH** `/api/bookings/:id` (Admin)
  - Updates booking status or details (approve/decline/complete/cancel).

---

## 8. User Authentication (`/api/auth`)
*Handles operator and client login/logout.*
- **POST** `/api/auth/login` (Public)
  - Logs in a user or admin and returns a session auth token.
- **POST** `/api/auth/logout` (Public)
  - Logs out the user and clears session context.
- **GET** `/api/auth/me` (Authenticated)
  - Returns logged-in profile metadata.

---

## 9. Portfolio Gallery (`/api/gallery`)
*Stores photography albums.*
- **GET** `/api/gallery` (Public)
  - Lists published albums (supports `category` filter).
- **GET** `/api/gallery/:id` (Public)
  - Fetches details of a single album.
- **GET** `/api/gallery/admin/all` (Admin)
  - Lists all albums.
- **POST** `/api/gallery` (Admin)
  - Creates an album.
- **PUT** `/api/gallery/:id` (Admin)
  - Updates album content, cover image, and metadata.
- **DELETE** `/api/gallery/:id` (Admin)
  - Deletes an album.

---

## 10. Testimonials (`/api/testimonials`)
*Manages customer feedback/reviews.*
- **GET** `/api/testimonials` (Public)
  - Lists approved testimonials.
- **GET** `/api/testimonials/admin/all` (Admin)
  - Lists all reviews.
- **POST** `/api/testimonials` (Admin)
  - Adds a testimonial.
- **PUT** `/api/testimonials/:id` (Admin)
  - Edits or approves a testimonial.
- **DELETE** `/api/testimonials/:id` (Admin)
  - Removes a testimonial.

---

## 11. Global Settings (`/api/settings`)
*Global contact information settings.*
- **GET** `/api/settings` (Public)
  - Returns global info (WhatsApp contact, social URLs, email).
- **POST** `/api/settings` (Admin)
  - Updates global contact settings.

---

## 12. Server Health Check (`/api/health`)
*System health indicators.*
- **GET** `/api/health` (Public)
  - Status indicator.
