# Full API Connection Guide

Follow these steps to connect your portal to Firebase Authentication, Google Sheets, and Google Drive.

---

## PART 1: Firebase Authentication

1. **Create a Firebase Project**
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Click **Add Project** and name it `DELitALL-Portal`.

2. **Enable Authentication**
   - Go to **Build -> Authentication**.
   - Click **Get Started**, select **Email/Password**, enable it, and click **Save**.

3. **Get API Keys**
   - Go to **Project Settings** (gear icon).
   - Scroll down to **Your apps**, click the Web icon (`</>`), name it `Portal-Web`, and click Register.
   - Copy the API keys into your `portal/.env.local` file.

4. **Create the Admin Account**
   - Go to **Authentication -> Users** and add your admin email/password.
   - This email MUST match the `NEXT_PUBLIC_ADMIN_EMAIL` in your `.env.local`.

---

## PART 2: Google Cloud Service Account (Sheets & Drive)

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project named `DELitALL Portal`.

2. **Enable APIs**
   - Go to **APIs & Services -> Library**.
   - Search for **Google Sheets API** and click Enable.
   - Search for **Google Drive API** and click Enable.

3. **Create a Service Account**
   - Go to **APIs & Services -> Credentials**.
   - Click **Create Credentials -> Service Account**.
   - Name it `portal-service` and click Done.
   - Copy the **Service Account Email**. Put this in your `.env.local` as `GOOGLE_SERVICE_ACCOUNT_EMAIL`.

4. **Generate JSON Key**
   - Click on the newly created Service Account.
   - Go to the **Keys** tab -> **Add Key -> Create new key -> JSON**.
   - Open the downloaded file. Find the `"private_key"` value (it starts with `-----BEGIN PRIVATE KEY-----`).
   - Copy that exact string (including `\n` characters) and paste it as `GOOGLE_PRIVATE_KEY` in `.env.local`.

---

## PART 3: Setting Up Sheets & Drive

1. **Create the Master Google Sheet**
   - Create a new Google Sheet.
   - Create these exact tabs:
     - `Overview`
     - `Interns`
     - `Web Development`
     - `UI UX Design`
     - `Product & QA`
     - `Marketing & Branding`
     - `Documentation & Support`
   - **Share this Sheet** as an "Editor" with the Service Account Email you created earlier.
   - Copy the Spreadsheet ID from the URL (the long string between `/d/` and `/edit`) into `GOOGLE_SHEET_ID`.

2. **Create the Master Google Drive Folder**
   - Go to Google Drive and create a folder named `DELitALL Internship Portal`.
   - **Share this Folder** as an "Editor" with the Service Account Email.
   - Copy the Folder ID from the URL into `GOOGLE_DRIVE_ROOT_FOLDER_ID`.
