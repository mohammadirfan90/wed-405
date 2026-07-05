# Chronos Moments - Postman API Testing Guide

This guide provides step-by-step instructions and request templates to test the Chronos Moments MERN portfolio backend endpoints using Postman.

---

## Getting Started

### 1. Environment Setup
To avoid repetitive configuration, create an **Environment** in Postman (e.g., `Chronos Moments - Local`) and add the following variables:

| Variable | Initial Value | Current Value | Description |
| :--- | :--- | :--- | :--- |
| `baseUrl` | `http://localhost:5000` | `http://localhost:5000` | Local port where your Node.js + Express backend is running. |
| `token` | *[Empty]* | *[Dynamically populated]* | Admin JWT authorization token returned after logging in. |
| `adminId` | *[Empty]* | *[Dynamically populated]* | The `_id` of the logged-in administrator. |
| `bookingId` | *[Empty]* | *[Dynamically populated]* | ID of a test booking. |
| `packageId` | *[Empty]* | *[Dynamically populated]* | ID of a test package. |
| `galleryId` | *[Empty]* | *[Dynamically populated]* | ID of a test gallery album. |
| `videoId` | *[Empty]* | *[Dynamically populated]* | ID of a test highlights video. |
| `slideId` | *[Empty]* | *[Dynamically populated]* | ID of a test hero background slide. |
| `testimonialId`| *[Empty]* | *[Dynamically populated]* | ID of a test testimonial. |
| `contentId` | *[Empty]* | *[Dynamically populated]* | ID of a test content document (e.g., dynamic sections). |

---

### 2. Automating Authentication (Recommended)
You can configure Postman to automatically parse the JWT token upon login and set the environment variable.

1. Create a request: **POST** `{{baseUrl}}/api/auth/login`.
2. Under the **Tests** tab, paste the following snippet:
   ```javascript
   const response = pm.response.json();
   if (pm.response.code === 200 && response.token) {
       pm.environment.set("token", response.token);
       if (response.user && response.user._id) {
           pm.environment.set("adminId", response.user._id);
       }
       console.log("Authentication successful! Token and adminId saved to environment.");
   }
   ```
3. In other authenticated request templates, navigate to the **Authorization** tab, select **Bearer Token** as type, and enter `{{token}}`.

---

## API Test Suites

### 1. User Authentication (`/api/auth`)
*Handles credentials and session control.*

#### A. Login (Public)
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/api/auth/login`
*   **Headers**:
    *   `Content-Type: application/json`
*   **Request Body** (JSON):
    ```json
    {
      "username": "admin", 
      "password": "Admin@12345"
    }
    ```
*   **Expected Response (200 OK)**:
    ```json
    {
      "user": {
        "_id": "64bf63989c...",
        "username": "admin",
        "name": "Super Admin",
        "phone": "+8801700000000",
        "email": "admin@chronosmoments.com",
        "role": "admin",
        "isActive": true,
        "isSuperAdmin": true,
        "lastLoginAt": "2026-06-29T09:00:00.000Z",
        "lastLoginIp": "::1"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

#### B. Get Logged-In Profile (Authenticated)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/auth/me`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`
*   **Expected Response (200 OK)**:
    ```json
    {
      "user": {
        "_id": "64bf63989c...",
        "username": "admin",
        "name": "Super Admin",
        "phone": "+8801700000000",
        "email": "admin@chronosmoments.com",
        "role": "admin",
        "isActive": true,
        "isSuperAdmin": true
      }
    }
    ```

#### C. Logout (Public)
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/api/auth/logout`
*   **Expected Response (200 OK)**:
    ```json
    {
      "message": "Logged out"
    }
    ```

---

### 2. Admin Security & Profile (`/api/admins`)
*Handles updates to profiles and password rotation.*

#### A. Update Administrator Profile (Admin Only)
*   **Method**: `PATCH`
*   **URL**: `{{baseUrl}}/api/admins/{{adminId}}`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "name": "Admin Updated",
      "email": "admin-updated@chronosmoments.com",
      "phone": "+8801711223344"
    }
    ```
*   **Expected Response (200 OK)**:
    ```json
    {
      "_id": "64bf63989c...",
      "username": "admin",
      "name": "Admin Updated",
      "email": "admin-updated@chronosmoments.com",
      "phone": "+8801711223344",
      "role": "admin",
      "isActive": true,
      "isSuperAdmin": true
    }
    ```

#### B. Rotate Admin Password (Admin Only)
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/api/admins/{{adminId}}/change-password`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "currentPassword": "Admin@12345",
      "newPassword": "NewAdmin@12345"
    }
    ```
*   **Expected Response (200 OK)**:
    ```json
    {
      "message": "Password updated"
    }
    ```

---

### 3. Consolidated Content Sections (`/api/content`)
*Manages story, home, and about text segments.*

#### A. Get Content Details (Public)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/content?section=home` *(Valid query options: `home`, `about`, `story`)*
*   **Expected Response (200 OK)**:
    ```json
    {
      "_id": "64bf66589c...",
      "section": "home",
      "heroText": "Turning Your Forever Moments into Timeless Memories",
      "bannerImage": "https://weddingheritagebd.com/wp-content/uploads/2026/02/01_1-scaled.jpg",
      "introText": "Welcome to Wedding Heritage."
    }
    ```

#### B. Get All Content for Section (Admin Only)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/content/admin/all?section=story`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`
*   **Expected Response (200 OK)**:
    ```json
    [
      {
        "_id": "64bf67999c...",
        "section": "story",
        "title": "Our Journey",
        "description": "Established in 2018...",
        "order": 1
      }
    ]
    ```

#### C. Create or Upsert Section (Admin Only)
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/api/content?section=story` *(Can pass as body too)*
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "title": "Founding of Chronos",
      "description": "Chronos Moments was founded by passion storytellers.",
      "order": 2,
      "imageUrl": "https://example.com/images/founding.jpg"
    }
    ```
*   **Expected Response (201 Created)**:
    ```json
    {
      "_id": "64bf68989c...",
      "section": "story",
      "title": "Founding of Chronos",
      "description": "Chronos Moments was founded by passion storytellers.",
      "order": 2,
      "imageUrl": "https://example.com/images/founding.jpg"
    }
    ```
*   *Tip: In Postman **Tests**, save this ID: `pm.environment.set("contentId", pm.response.json()._id);`*

#### D. Update Section by ID (Admin Only)
*   **Method**: `PUT`
*   **URL**: `{{baseUrl}}/api/content/{{contentId}}`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "title": "Founding of Chronos (Updated)",
      "order": 1
    }
    ```
*   **Expected Response (200 OK)**:
    ```json
    {
      "_id": "64bf68989c...",
      "section": "story",
      "title": "Founding of Chronos (Updated)",
      "description": "Chronos Moments was founded by passion storytellers.",
      "order": 1,
      "imageUrl": "https://example.com/images/founding.jpg"
    }
    ```

#### E. Delete Content by ID (Admin Only)
*   **Method**: `DELETE`
*   **URL**: `{{baseUrl}}/api/content/{{contentId}}`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`
*   **Expected Response (200 OK)**:
    ```json
    {
      "message": "Content deleted successfully"
    }
    ```

---

### 4. Dashboard Statistics (`/api/dashboard`)
*Aggregates high-level metrics for admin view.*

#### A. Get Dashboard Stats (Admin Only)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/dashboard/stats`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`
*   **Expected Response (200 OK)**:
    ```json
    {
      "totalBookings": 15,
      "pendingBookings": 3,
      "totalPackages": 6
    }
    ```

> [!TIP]
> **💡 Frontend Integration Tips:**
> * **State Setup**: Define a local state hook in your main Admin Profile or Dashboard home component: `const [stats, setStats] = useState({ totalBookings: 0, pendingBookings: 0, totalPackages: 0 });`
> * **API Call**: Fetch this endpoint inside a `useEffect` hook on component mount. Don't forget to pass the `Authorization` header containing the Bearer token.
> * **Error Handling**: Provide a fallback string or skeleton loading state (e.g., `'Loading stats...'`) while the API call is in progress.

---

### 5. Packages and Pricing (`/api/packages`)
*Manages photo/video bundles available for booking.*

#### A. List Active Packages (Public)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/packages` *(Optional query filters: `?category=Wedding` or `?status=active`)*
*   **Expected Response (200 OK)**:
    ```json
    [
      {
        "_id": "64bf78549c...",
        "title": "Classic Wedding Package",
        "slug": "classic-wedding-package",
        "category": "Wedding",
        "price": 35000,
        "currency": "BDT",
        "duration": "8 hours",
        "description": "Standard coverage...",
        "features": ["1 Chief Photographer", "1 Associate Photographer", "Unlimited images"],
        "coverImage": "https://example.com/images/classic.jpg",
        "isActive": true
      }
    ]
    ```

#### B. Create New Package (Admin Only)
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/api/packages`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "title": "Premium Wedding Package",
      "category": "Wedding",
      "price": 60000,
      "currency": "BDT",
      "duration": "10 hours",
      "description": "High-end wedding memories collection.",
      "features": [
        "2 Senior Photographers",
        "Premium photobook",
        "All raw files"
      ],
      "coverImage": "https://example.com/images/premium.jpg",
      "isActive": true
    }
    ```
*   **Expected Response (201 Created)**:
    ```json
    {
      "_id": "64bf7a889c...",
      "title": "Premium Wedding Package",
      "slug": "premium-wedding-package",
      "category": "Wedding",
      "price": 60000,
      "currency": "BDT",
      "duration": "10 hours",
      "description": "High-end wedding memories collection.",
      "features": ["2 Senior Photographers", "Premium photobook", "All raw files"],
      "coverImage": "https://example.com/images/premium.jpg",
      "isActive": true,
      "createdAt": "2026-06-29T09:10:00.000Z"
    }
    ```
*   *Tip: In Postman **Tests**, save this ID: `pm.environment.set("packageId", pm.response.json()._id);`*

#### C. Get Single Package Details (Public)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/packages/{{packageId}}`
*   **Expected Response (200 OK)**:
    *(Returns the individual package document matching the packageId)*

#### D. List All Packages - Including Inactive (Admin Only)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/packages/admin/all`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`

#### E. Update Package (Admin Only)
*   **Method**: `PUT`
*   **URL**: `{{baseUrl}}/api/packages/{{packageId}}`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "price": 65000,
      "duration": "12 hours"
    }
    ```
*   **Expected Response (200 OK)**:
    *(Returns updated package document with the new price and duration)*

#### F. Delete Package (Admin Only)
*   **Method**: `DELETE`
*   **URL**: `{{baseUrl}}/api/packages/{{packageId}}`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`
*   **Expected Response (200 OK)**:
    ```json
    {
      "message": "Package deleted"
    }
    ```

> [!TIP]
> **💡 Frontend Integration Tips:**
> * **Numbers Parsing**: When sending fields like `price` in POST/PUT forms, ensure they are sent as numbers, not strings. Use `Number(priceInput)` or `parseInt(priceInput, 10)` in your form state handlers.
> * **Hardcoded Category Enum**: When rendering dropdown options for the package category, use the hardcoded frontend array: `['Wedding', 'Cinematography', 'Pre-Wedding', 'Engagement', 'Event', 'Custom', 'Holud']`.
> * **Features List**: Since `features` is an array, you can let admins enter it in a textarea separated by newlines, then convert it before sending: `features: featuresTextarea.split('\n').map(f => f.trim()).filter(Boolean)`.

---

### 6. Hero Slider (`/api/hero`)
*Manages home view hero image carousels.*

#### A. Get Active Hero Slides (Public)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/hero`

#### B. Create Hero Slide (Admin Only)
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/api/hero`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "title": "Welcome to Chronos Moments",
      "subtitle": "Capturing timeless love",
      "image": "https://example.com/slides/slide1.jpg",
      "order": 1
    }
    ```
*   **Expected Response (201 Created)**:
    ```json
    {
      "_id": "64bf82019c...",
      "title": "Welcome to Chronos Moments",
      "subtitle": "Capturing timeless love",
      "image": "https://example.com/slides/slide1.jpg",
      "order": 1
    }
    ```
*   *Tip: In Postman **Tests**, save this ID: `pm.environment.set("slideId", pm.response.json()._id);`*

#### C. List All Slides (Admin Only)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/hero/admin/all`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`

#### D. Edit Slide Details (Admin Only)
*   **Method**: `PUT`
*   **URL**: `{{baseUrl}}/api/hero/{{slideId}}`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "order": 2,
      "subtitle": "Capturing your love story"
    }
    ```

#### E. Delete Slide (Admin Only)
*   **Method**: `DELETE`
*   **URL**: `{{baseUrl}}/api/hero/{{slideId}}`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`

> [!TIP]
> **💡 Frontend Integration Tips:**
> * **Display Order**: The public carousel should sort slides by the `order` property in ascending sequence: `const sortedSlides = [...slides].sort((a, b) => a.order - b.order);`
> * **Image Uploading Integration**: Utilize the file upload field helper to post a raw file to `/api/uploads`, wait for the returned secure image URL string, and set it as the value of the `image` field before posting to this API.

---

### 7. Video Highlights (`/api/videos`)
*Manages embedded highlight films.*

#### A. Get Video Highlights (Public)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/videos`

#### B. Create Video Link (Admin Only)
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/api/videos`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "title": "Highlights Reel 2026",
      "order": 1
    }
    ```
*   **Expected Response (201 Created)**:
    ```json
    {
      "_id": "64bf8a999c...",
      "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "title": "Highlights Reel 2026",
      "order": 1
    }
    ```
*   *Tip: In Postman **Tests**, save this ID: `pm.environment.set("videoId", pm.response.json()._id);`*

#### C. Update Highlights Video (Admin Only)
*   **Method**: `PUT`
*   **URL**: `{{baseUrl}}/api/videos/{{videoId}}`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "title": "Highlights Reel 2026 (Updated)"
    }
    ```

#### D. Delete Video Highlight (Admin Only)
*   **Method**: `DELETE`
*   **URL**: `{{baseUrl}}/api/videos/{{videoId}}`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`

> [!TIP]
> **💡 Frontend Integration Tips:**
> * **YouTube Embed conversion**: Standard YouTube video URLs cannot be used directly in HTML `<iframe>` tags. You must extract the 11-character video ID and convert it into a `/embed/` link:
>   ```javascript
>   function getYouTubeEmbedUrl(url) {
>     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
>     const match = url.match(regExp);
>     return (match && match[2].length === 11) 
>       ? `https://www.youtube.com/embed/${match[2]}` 
>       : '';
>   }
>   ```

---

### 8. User Bookings (`/api/bookings`)
*Manages appointment registrations.*

#### A. Submit Booking Reservation Request (Public / Optional Authenticated)
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/api/bookings`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}` *(Optional: will link user schema id if present)*
*   **Request Body** (JSON):
    ```json
    {
      "packageId": "{{packageId}}",
      "eventDate": "2026-10-15T00:00:00.000Z",
      "venue": "Grand Hall Room, Dhaka",
      "guests": 300,
      "notes": "Need drone coverage if possible.",
      "contactPhone": "+8801712345678",
      "contactEmail": "customer@example.com"
    }
    ```
*   **Expected Response (201 Created)**:
    ```json
    {
      "_id": "64bf91239c...",
      "package": "64bf7a889c...",
      "eventDate": "2026-10-15T00:00:00.000Z",
      "venue": "Grand Hall Room, Dhaka",
      "guests": 300,
      "notes": "Need drone coverage if possible.",
      "contactPhone": "+8801712345678",
      "contactEmail": "customer@example.com",
      "status": "pending"
    }
    ```
*   *Tip: In Postman **Tests**, save this ID: `pm.environment.set("bookingId", pm.response.json()._id);`*

#### B. List All Booking Reservations (Admin Only)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/bookings` *(Optional status filter: `?status=pending` or `?status=approved`)*
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`

#### C. Update Booking Status (Admin Only)
*   **Method**: `PATCH`
*   **URL**: `{{baseUrl}}/api/bookings/{{bookingId}}`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "status": "approved" 
    }
    ```
    *(Allowed status values: `pending`, `approved`, `declined`, `completed`, `cancelled`)*
*   **Expected Response (200 OK)**:
    *(Returns the updated booking object showing the new status)*

> [!TIP]
> **💡 Frontend Integration Tips:**
> * **ISO Dates**: Standard calendar inputs (`<input type="date">`) yield `YYYY-MM-DD` strings. You must convert these into standard ISO strings before calling POST: `new Date(dateValue).toISOString()`.
> * **Displaying Badges**: Map status keywords to tailwind color styles for clean status indicators:
>   ```javascript
>   const BADGE_COLORS = {
>     pending: 'bg-yellow-100 text-yellow-800',
>     approved: 'bg-blue-100 text-blue-800',
>     declined: 'bg-red-100 text-red-800',
>     completed: 'bg-green-100 text-green-800',
>     cancelled: 'bg-gray-100 text-gray-800'
>   };
>   ```

---

### 9. Portfolio Gallery (`/api/gallery`)
*Albums displaying wedding event photography.*

#### A. List Published Albums (Public)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/gallery` *(Optional filter: `?category=Wedding`)*

#### B. Get Details of Single Album (Public)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/gallery/{{galleryId}}`

#### C. List All Albums (Admin Only)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/gallery/admin/all`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`

#### D. Create Gallery Album (Admin Only)
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/api/gallery`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "title": "A & B Wedding Story",
      "category": "Wedding",
      "url": "https://example.com/gallery/a-and-b",
      "coverImage": "https://example.com/images/cover.jpg",
      "images": [
        "https://example.com/images/pic1.jpg",
        "https://example.com/images/pic2.jpg"
      ],
      "description": "Stunning outdoor wedding memories.",
      "eventDate": "2026-05-10",
      "location": "Dhaka, Bangladesh",
      "tags": ["outdoor", "sunset", "wedding"],
      "isPublished": true,
      "isFeatured": true
    }
    ```
*   **Expected Response (201 Created)**:
    ```json
    {
      "_id": "64bfa1019c...",
      "title": "A & B Wedding Story",
      "slug": "a-b-wedding-story",
      "category": "Wedding",
      "url": "https://example.com/gallery/a-and-b",
      "coverImage": "https://example.com/images/cover.jpg",
      "images": ["https://example.com/images/pic1.jpg", "https://example.com/images/pic2.jpg"],
      "description": "Stunning outdoor wedding memories.",
      "eventDate": "2026-05-10T00:00:00.000Z",
      "location": "Dhaka, Bangladesh",
      "tags": ["outdoor", "sunset", "wedding"],
      "isPublished": true,
      "isFeatured": true,
      "createdAt": "2026-06-29T09:15:00.000Z"
    }
    ```
*   *Tip: In Postman **Tests**, save this ID: `pm.environment.set("galleryId", pm.response.json()._id);`*

#### E. Update Gallery Album (Admin Only)
*   **Method**: `PUT`
*   **URL**: `{{baseUrl}}/api/gallery/{{galleryId}}`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "isFeatured": false,
      "location": "Cox's Bazar, Bangladesh"
    }
    ```

#### F. Delete Gallery Album (Admin Only)
*   **Method**: `DELETE`
*   **URL**: `{{baseUrl}}/api/gallery/{{galleryId}}`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`

> [!TIP]
> **💡 Frontend Integration Tips:**
> * **Hardcoded Admin Dropdowns**: There is no dynamic category manager page. Categories for gallery albums are managed on the client side using the dropdown array: `['Wedding', 'Pre-Wedding', 'Engagement', 'Event', 'Cinematography', 'Holud', 'Other']`.
> * **Category Extraction**: To populate filter tabs on public portfolio pages dynamically without hardcoding them:
>   ```javascript
>   const portfolioItems = await getPortfolio();
>   const categories = ['All', ...new Set(portfolioItems.map(p => p.category).filter(Boolean))];
>   ```

---

### 10. Testimonials (`/api/testimonials`)
*Visitor reviews and feedback.*

#### A. List Approved Reviews (Public)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/testimonials`

#### B. Create Testimonial (Admin Only)
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/api/testimonials`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "authorName": "Melissa Smith",
      "role": "Bride",
      "avatar": "https://example.com/avatars/melissa.jpg",
      "rating": 5,
      "body": "They captured our day perfectly! Highly recommended.",
      "package": "{{packageId}}",
      "isApproved": true
    }
    ```
*   *Tip: In Postman **Tests**, save this ID: `pm.environment.set("testimonialId", pm.response.json()._id);`*

#### C. List All Reviews (Admin Only)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/testimonials/admin/all`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`

#### D. Edit or Approve Review (Admin Only)
*   **Method**: `PUT`
*   **URL**: `{{baseUrl}}/api/testimonials/{{testimonialId}}`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "isApproved": true
    }
    ```

#### E. Delete Testimonial (Admin Only)
*   **Method**: `DELETE`
*   **URL**: `{{baseUrl}}/api/testimonials/{{testimonialId}}`
*   **Headers**:
    *   `Authorization`: `Bearer {{token}}`

> [!TIP]
> **💡 Frontend Integration Tips:**
> * **Star Ratings Rendering**: Testimonial `rating` is stored as an integer from 1 to 5. Render stars on the client side using a simple loop: `Array.from({ length: 5 }, (_, i) => i < rating ? '★' : '☆')`.
> * **Package Linking**: The `package` property stores the ID of the package booked. You can match it up with the response from the `/api/packages` endpoint to show which package they reviewed.

---

### 11. Global Settings (`/api/settings`)
*Global configurations, contact coordinates, social URLs.*

#### A. Get Global Settings (Public)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/settings`
*   **Expected Response (200 OK)**:
    ```json
    {
      "whatsapp": "+8801700000000",
      "email": "contact@chronosmoments.com",
      "facebookUrl": "https://facebook.com/chronosmoments"
    }
    ```

#### B. Update Global Setting (Admin Only)
*   **Method**: `POST`
*   **URL**: `{{baseUrl}}/api/settings`
*   **Headers**:
    *   `Content-Type`: `application/json`
    *   `Authorization`: `Bearer {{token}}`
*   **Request Body** (JSON):
    ```json
    {
      "key": "whatsapp",
      "value": "+8801711223344"
    }
    ```
*   **Expected Response (200 OK)**:
    ```json
    {
      "_id": "64bfd8889c...",
      "key": "whatsapp",
      "value": "+8801711223344",
      "createdAt": "2026-06-29T09:20:00.000Z",
      "updatedAt": "2026-06-29T09:22:00.000Z"
    }
    ```

> [!TIP]
> **💡 Frontend Integration Tips:**
> * **State Provider**: Since settings control global info displayed in the footer and contact forms, fetch them once at the root layout level (`App.jsx` or an AppContext) and share them down. This avoids calling `/api/settings` repeatedly across different pages.

---

### 12. Server Health Check (`/api/health`)
*System check endpoint.*

#### A. Health Check (Public)
*   **Method**: `GET`
*   **URL**: `{{baseUrl}}/api/health`
*   **Expected Response (200 OK)**:
    ```json
    {
      "ok": true,
      "service": "chronos-moments"
    }
    ```

---

## Troubleshooting & FAQ

#### 1. Why do I get a `401 Not authenticated` error?
*   Ensure that the `token` environment variable is correctly set and not expired.
*   Check that you have selected the `Bearer Token` type in your request's Authorization tab and mapped it to `{{token}}`.

#### 2. Why do I get a `403 Forbidden: insufficient role` error?
*   This error means your JWT is valid, but the user account associated with it does not have the `admin` role required for this specific endpoint.

#### 3. Why are my local cookies not sending?
*   If testing cookie-based authentication, ensure you have enabled cookie storage in Postman and that your domain configuration matches. Bearer tokens in headers are the recommended approach for testing.
