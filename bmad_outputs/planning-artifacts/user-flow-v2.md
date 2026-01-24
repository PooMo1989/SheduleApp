# User Flow v2 - Complete Platform Perspective

## 1. Owner Onboarding

### 1.1 Sign Up & Sign In
- Owner signs up via **email** or **SSO (Google)**
- Owner is signed in and lands on the dashboard
- *(Future: Onboarding wizard to guide first-time setup)*

### 1.2 Company Setup
- Owner navigates to the **Company** tab in the sidebar
- Fills in basic company information:
  - Company name
  - Logo upload
  - Branding colours (primary, secondary)
  - Business category/industry
  - Contact information (phone, email, address)
  - Timezone
  - Business hours (default operating hours)
  - currency (*)
- Owner understands these can be refined later and proceeds with minimal setup

### 1.3 Payment Integration Setup
- Accessible from **Company > Payments** sub-tab or **Settings > Payments**

for comapy payment setup i think better to have company>payment worflow where the comany page has two tabs, General Information and Payment Configration
beace i woul use settings>payments to set up payments for the company and me as the saas product owner so it will be Settings>payments and billing info

what do you think?

- Configuration:
  | Field | Required | Notes |
  |-------|----------|-------|
  | Payment gateway | Yes | Stripe (default) / PayPal / Manual |
  | Currency | Yes | Default currency for all services |
  | Tax settings | No | Tax rate, tax ID display |
  | Payout schedule | No | Daily / Weekly / Monthly |
  | Refund policy | No | Auto-refund window in hours |
- Owner connects their Stripe/PayPal account via OAuth flow
- Payment status indicator shows "Connected" / "Not configured"
- Services cannot collect payments until a gateway is connected

> **Note:** cant do stripe or paypal. it has to be pay here or other local payment gateway. and aslo here we canoot have them to configure payment gateways yet the idea is to collect payment on our own payment gateway track transcation for each teneta and send them manually. beacuse it is difficult to setup multi tenenat transaction portal with technology avaialble in sri lanka. just check the payment gateway options available in sri lanka. i have added details to the epic where we implement payemst. but here in the payments sub tab we can include configuration on how to collect payment like they include their bank details so the saas own can reimbures. so baically when clients check out they will have two options. pay,ent gateway added by the SAAS owner which is recorde in the saas owner backend and pay later option where the clints selects this option and the company owner can approve the booking. once he approve the booking records are created and the email is sent to the client. we can let the owner or admin to decide to have paylater option for each service or not and also enable manual approvel of pay later option. 

> **Note:**  what do you think? analyse and tell me. fo this you will need to exsiting epics as well


### 1.4 Next Steps - Two Paths
After company setup, the owner has two options:
1. **Add a team member first** (delegate service/provider setup to a tech-savvy admin)
2. **Add a service directly** (then assign or invite a provider)

> **Business Rule:** A provider is created in **"Pending"** state when invited. They become **"Active"** only after accepting the invitation AND being assigned to at least one service. This avoids the chicken-and-egg problem while maintaining the rule that active providers must have a service.

---

## 2. Dashboard (Owner/Admin)

### 2.1 Dashboard Content
The dashboard is the landing page after sign-in and provides an at-a-glance overview:

- **Today's Schedule** - Timeline view of today's appointments across all providers
- **Quick Stats Cards:**
  - Bookings this week (with trend vs. last week)
  - Pending confirmations (action required)
  - Cancellations this week
  - Revenue this week (if payments configured)
- **Recent Activity Feed** - Latest bookings, cancellations, new client sign-ups
- **Upcoming Appointments** - Next 5 appointments with client name, service, provider, time
- **Action Items** - Pending invitations, unconfirmed bookings, schedule conflicts

---

## 3. Team Member Management (Owner Flow)

### 3.1 Teams Tab
- Owner navigates to the **Team** tab in the sidebar
- Sees a list of team members (empty on first visit)

### 3.2 Add Team Member
- Clicks **"Add Team Member"** button
- A form renders inline on the page (not a popup/modal)
- Form fields:
  | Field | Required | Notes |
  |-------|----------|-------|
  | Name | Yes | Full name of the team member |
  | Email | Yes | Used for invitation delivery |
  | Mobile Number | No | Optional contact number |
  | Role/Position | No | e.g., Admin, Receptionist, Manager |
- Clicks **"Send Email Invitation"** button
- Invitation is sent in the background
- Team member status shows as **"Pending"** in the list

> **Note:** lets keep only postion field and remove role field beacuse it can confuse. roles are striclty for system management purpose and position for dispaly puposes and may be future developmets.

> **Note:** i want the Team member profile to have more infomtion like profile picture ect in baseic information sub tab and also add a new sub tab called management where they can see ther services they manage and providers they manage and assign clits they need to be in tocuh with ect. but i dont think these firleds should be there in the add memebr form where we send an invitation. either owner or the team member/admin can herself add this infomation later.

 > **Note:** and also i am think if we are assigning services service providers and clients to a team member or owner herself we might need to have and additional column in data tables to accoumadate this. just cehck and see whether we need to have new stories for databases. 

### 3.3 Team Member List View

when you goto team maintab this is the dafault view list of team memebrs
Once invitations are accepted, the list populates with:
- Member name
- Role/Position
- Status (Pending / Active)
- Date joined
> **Note:** we can add profile pic or avatar to make it look better and i dont think date joine is necssary. is it should be name , positon , status and a minimized profile pic or avata view. and also staus toggle active inactive toglle to make quick changes, mey be when the memeber is temporarily unavaile. i dont think we need to show pending status beacuse in the add memeber page there is a list of pending mmebrs who have not accepted the invitation yet.

> **Note:** we can add a search bar and or filter to the top of the list to make it easier to find specific team members.whats your thoughts? and also 

### 3.4 Individual Team Member View
- Clicking a member name triggers:
  - The list pane slides to the left (compressed)
  - The sidebar collapses to icon-only mode
  - The member detail panel expands on the right
- **Tabs within individual member view:**
  1. **Details** - Personal info, contact details, role, status
  2. **Management** - Overview of:
     - Providers they manage
     - Services they oversee
     - Clients they handle
  3. **Activity** - Recent actions/changes made by this member
  4. **Permissions** - Access level configuration

> **Note:** for managment who can assign serivice, providers and clints to members. since we only have owner and memeber as admins? is this necessary at this stage. i think its necessary bcase when a memebrr goes to dashbaord rather than seeing detilas about all services and clients a member may prfere to see assigned clints. if this assignment is complicated the own can decide not to have it on sesstings. in the company tab we can have a sub tab to have comapny settings which include settings like this. but will this over complicate things? will this reure critical database resturcte, what do you think or should we have this in a new phase where we figure out HR managment for team members.??? but to do that in the future does the current structrue and archtecture allow it. i think even smiply book me doesnt have it. check and suggest
---

## 4. Responsive View Logic (Calendly-Style)

### 4.1 Desktop View
- Persistent sidebar with full labels
- Main content area with list + detail split view
- Clicking an item: list compresses left, detail expands right
- Sidebar collapses to icons when detail view is active

### 4.2 Mobile View
- Sidebar becomes a **hamburger menu**
- Selected main menu item displays in the main viewport
- **Navigation pattern:**
  1. Open hamburger → Select "Team"
  2. See list of team members with **filter tabs on top**
  3. Tap a member → Full-screen member detail view with **tabs above**
  4. **X button** at top-right to dismiss individual view and return to the list
- This is the **default navigation pattern** applied consistently across all sections

### 4.3 Mobile Tab Limit Guideline
- Maximum **3 tabs** visible on mobile without scrolling
- If a section has 4+ tabs, use a horizontally scrollable tab bar with subtle overflow indicator
- Primary/most-used tabs appear first
- Alternatively, group less-critical tabs under a "More" option on mobile

---

## 5. Admin/Team Member Flow (Invited)

### 5.1 Accepting Invitation
- Team member receives email invitation from the owner
- Clicks the invitation link → redirected to sign-up page
- Signs up via **SSO (Google)** or email
- Signs in and sees the dashboard with sidebar

### 5.2 Admin Capabilities
- Admin can create services (same flow as owner)
- Admin can create/manage providers
- Admin can view team members (based on permissions)

> **Note:** 
Again manigning other memeber can be added to HR module where we can have team and team leader structure, may be it is too compicated at this satge
---

## 6. Service Management

### 6.1 Services Tab
- Navigate to **Services** in the sidebar
- View services organized by **category**
- **Category filter** at the top to narrow the list
- Each category expands to show its services

### 6.2 Add New Service
- Click **"Add Service"** button
- Enters the **Service Setup Portal** with tabbed navigation:

#### Tab 1: Basics & Settings
| Field | Required | Notes |
|-------|----------|-------|
| Service name | Yes | Display name for the service |
| Category | Yes | Select or create a category |
| Description | No | Rich text description |
| Duration | Yes | Length of the appointment |
| Buffer time (before) | No | Prep time between appointments |
| Buffer time (after) | No | Wrap-up time between appointments |
| Pricing type | Yes | Free / Fixed / Variable / Starting from |
| Price | Conditional | Required if pricing type is not Free |
| Currency | Yes | Default from company settings |
| Location type | Yes | In-person / Virtual / Both |
| Virtual meeting link | Conditional | If virtual, auto-generate or custom URL |
| Max attendees | No | For group services (default: 1) |
| Booking window | No | How far in advance can clients book |
| Cancellation policy | No | Hours before appointment |
| Auto-confirm bookings | No | Toggle (default: Yes) |
| Visibility | No | Public / Private (invite-only) |

#### Tab 2: Schedule & Provider Assignment
| Field | Required | Notes |
|-------|----------|-------|
| Available days | Yes | Select days of the week |
| Available hours | Yes | Per-day time slots |
| Break times | No | Recurring breaks within available hours |
| Special dates (blocked) | No | Holidays, days off |
| Provider assignment | Yes | Select from existing or invite new |

- **Provider Assignment Options:**
  - Select from dropdown of existing providers
  - Send invitation to a new provider via email link

> **Note:**  can we have a team memebers also in this list with a speration heading and what is the flow if a memebr/admin is assigned. her role couln should be updated with provider role and should have her own serives offering in the dash board i mean now this person has two dashboards , admin dash board and service provider dashbaord . so i think best way to resove this is to have to have dashboard only for the admin and owner and appointments tab for the providers. appointments main tab will be basically the dashbaord for someone who is bookable and dashboar is for the someone who handle overal management. so if a provider aslo becomes an team meber/admin he will get dashbaord. if an admin becomes a provider he will get appointments tab

> **Note:** now the appointments tab basically include the dashboard of service provider. once click in the main view his upcoming appointments, there is dropdown at the top to select a specivifc service with all services selected by defuly (if the provider is offering mutiple services ) and below hat tabs with upcoing, past, selecte a date rande and below thata calndar viwe or list view of the appointments



- **Conflict Detection:**
  - If assigning an existing provider, the system checks for schedule conflicts
  - If conflicts exist, the owner is informed with:
    - A list of conflicting time slots
    - Options: Adjust this service's schedule / Adjust the other service / Override

#### Tab 3: Booking Page Configuration
| Field | Required | Notes |
|-------|----------|-------|
| Custom URL slug | No | e.g., `/haircut` → `yourcompany.app/haircut` |
| Booking page title | No | Defaults to service name |
| Description (public) | No | What clients see before booking |
| Show price | No | Toggle to display pricing on booking page |
| Show duration | No | Toggle to display duration |
| Require client account | No | Toggle: guest booking vs. registered only |
| Booking confirmation message | No | Custom thank-you text |
| Redirect after booking | No | Custom URL to redirect client post-booking |
| Embed options | No | iframe code / JS widget snippet for external sites |

### 6.3 Notification Templates
- Accessible from a **dedicated sidebar menu item** ("Notifications")
- Not embedded within the service setup flow
- Templates can be linked to services from this central location

#### Available Template Types
| Template | Trigger | Recipient | Default |
|----------|---------|-----------|---------|
| Booking confirmation | New booking created | Client | Enabled |
| Booking confirmation (internal) | New booking created | Provider/Admin | Enabled |
| Reminder | Configurable (24h, 1h before) | Client | Enabled (24h) |
| Reminder (internal) | Configurable (24h, 1h before) | Provider | Enabled (1h) |
| Cancellation notice | Booking cancelled | Client | Enabled |
| Cancellation notice (internal) | Booking cancelled | Provider/Admin | Enabled |
| Reschedule notice | Booking rescheduled | Client | Enabled |
| Reschedule notice (internal) | Booking rescheduled | Provider | Enabled |
| Follow-up / Thank you | Configurable (1h, 24h after) | Client | Disabled |
| No-show notice | Marked as no-show | Client | Disabled |
| Invitation | Team/Provider invited | Invitee | Enabled |

#### Template Configuration
- Each template supports:
  - Email subject line
  - Email body (rich text with merge fields: `{{client_name}}`, `{{service_name}}`, `{{date}}`, `{{time}}`, `{{provider_name}}`, `{{location}}`)
  - SMS body (if SMS enabled)
  - Enable/Disable toggle per service
  - Timing configuration (for reminders and follow-ups)

### 6.4 Editing Services
- Owner/Admin can revisit any service from the services list
- Click on a service → opens the same tabbed portal in edit mode
- All fields are editable with inline save
- Change history/audit log available

---

## 7. Provider Management (Owner/Admin View)

### 7.1 Providers Tab
- **Separate sidebar item** from Team (not a sub-tab)
- Shows a list of all service providers
- Each entry shows: Name, services assigned, status

### 7.2 Individual Provider View
- Click a provider → same slide-left pattern as team members
- **Tabs within provider view:**
  1. **Details** - Personal info, contact, specializations
  2. **Services** - List of services this provider offers
  3. **Schedule** - Their availability and calendar view
  4. **Appointments** - Upcoming and past bookings
  5. **Clients** - Clients they serve (without private notes)
  6. **Performance** - Ratings, completion rate, no-shows
- **X button** to return to the providers list
- Owner/Admin can edit basic information about the provider

> **Note:** Owner/Admin can see everything the provider sees on their own dashboard **EXCEPT** the provider's personal/private client notes.

### 7.3 Provider Schedule Change Notifications
- When a provider modifies their own availability, the system:
  - Notifies the owner/admin of the change
  - Highlights any appointments affected by the new availability
  - Optionally requires admin approval before changes take effect (configurable in Settings)
- Owner/Admin can configure per-provider:
  - **Self-managed** - Provider changes take effect immediately, admin is notified
  - **Approval required** - Provider submits change request, admin approves/rejects

### 7.4 Add New Provider
- Click **"Add New Provider"** button
- Form fields:
  | Field | Required | Notes |
  |-------|----------|-------|
  | Name | Yes | Provider's full name |
  | Email | Yes | For invitation |
  | Mobile Number | No | Contact number |
  | Specialization | No | Area of expertise |
  | Services | No | Pre-assign to existing services |
  | Schedule autonomy | No | Self-managed / Approval required |
- Click **"Send Invitation"**
- Provider appears in list as **"Pending"** until they accept and are assigned a service

---

## 8. Service Provider Flow (Invited Provider)

### 8.1 Accepting Invitation
- Provider receives invitation email from owner/admin
- Clicks the link → redirected to sign-up page
- Signs up via **Google SSO** or email
- Signs in and sees their provider dashboard

### 8.2 Provider Dashboard
The provider's personal portal with tabbed navigation:

> **Note:** provider sahdboard is the appointments tab in the main sidebar  or hamberger menu for mobile view


#### Tab 1: Dashboard
- **Upcoming appointments** - Chronological list with client name, service, time
- **Past appointments** - Historical record
- **Filters:**
  - Time frame (Today / This week / This month / Custom range)
  - Service type (if provider offers multiple services)
  - Status (Confirmed / Pending / Cancelled / Completed / No-show)
- **Actions per appointment:**
  - Mark as completed
  - Mark as no-show
  - Reschedule (see Section 10)
  - Cancel (see Section 10)

#### Tab 2: Schedule/Availability
- Set personal availability (days and hours)
- Mark special days (vacations, holidays, blocked times)
- View service-level schedule overlaid on personal availability
- **Google Calendar integration:**
  - Link Google Calendar account
  - Sync to prevent double-booking
  - Choose conflict resolution preference (auto-block / notify)
- Changes may require admin approval depending on provider's schedule autonomy setting

> **Note:** calandely has two calanders, calander to add events and calander to check fo conflicts, do we need two or one is enough for both, can we have tow later in a next phase without much trouble?

#### Tab 3: Clients
- List of all clients who have booked with this provider

> **Note:** this shoud have a fileter to fliter clints based on serivce, if he offers multiple services and may be a serch if necssary, use whatever is standars and userfirendly 

- Click a client name → view:
  - Client contact information
  - Booking history with this provider
  - **Personal notes** (private to this provider only)
    - Free-text notes per session
    - Only visible to the provider themselves
    - Owner/Admin **cannot** access these notes

> **Privacy Rule:** Personal notes are strictly private to the provider. No other role (owner, admin, team member) can view these notes.

#### Tab 4: Profile
- Edit personal information:
  - Display name
  - Bio/About
  - Profile photo upload
  - Contact preferences
  - Notification settings

---

## 9. Client Booking Flow (Public-Facing)

### 9.1 Accessing the Booking Page
- Client arrives via:
  - Direct booking link (e.g., `yourcompany.scheduleapp.com/haircut`)
  - Embedded widget on external website
  - QR code (generated in booking page settings)
  - Shared link from owner/provider

  > **Note:** lets  remove QR. the clients can come from adirect link where the owner or admin can generate a link for a specific service, specifice service provider or specifice service provider and service together. the interface to generate the link is same as the wiget creation tab. there are sub tab in taht main tab whic are 1. generate embedding code, 2. generate direct link. bith has same interface where they can select a serivce, serive provider or both for more specic and as output tab one will generate embeding code and tab 2 will geerateshareble link.

### 9.2 Booking Process
1. **Select Service** - If booking page is company-level, client chooses a service category and service
2. **Select Provider** (if multiple) - Client sees available providers with name, photo, bio

> **Note:** this should be already done by the company side web. depending on the comanys service they should decide wether to give priority to service or service provide and base on that they can create different widegts and embed. if the comapny want our app to be the public facing interface wehre the clintes come to book i think we should provide a tempalte based configuration with minila cutomizations. what do you think? this can be a different serive or should be added to the next phase with a stire front tab where they can configure the store front properly. 


3. **Select Date & Time** - Calendar view showing available slots based on:
   - Service schedule
   - Provider availability
   - Existing bookings
   - Google Calendar conflicts (if integrated)

> **Note:** arnt exisitng books and google candar is the sam beacuse we are using google calander for booking conflict and see wether there are exsotng books, all the exoting bookings made through our platform as well as providers own appointments are already sheduled in google calander.so i think we shoud chek for custome datte overrides set by the clients for specific dates where is is not availble even though his weekly availability is there. this is already addred in the 4 layer availbility engine. you can check. 

4. **Enter Details** - Client fills in:
   | Field | Required | Notes |
   |-------|----------|-------|
   | Name | Yes | Full name |
   | Email | Yes | For confirmation and reminders |
   | Phone | Configurable | Owner decides if required |
   | Notes/Reason | No | Free text for context |
   | Custom fields | Configurable | Owner-defined per service |
5. **Payment** (if applicable) - Client pays via configured gateway (Stripe/PayPal)

> **Note:** this has to change beasue as i tole in the eralier of this docuemtnaslso stipe and and pay pal are not avaiable in sri lanka and its difficult to configure a payment gateway for each compay from our end. just see payhere allows this multitenant payment configuration but i dont think so . so the idea is SAAS owner will have a payment gateay to collect payment and manulayy or with a sytem redistibuted the collected payments. And also the comany can decide to have pay later otion also where client can select this option continue the booking. owner will/admin will decide this payment will directly make a booking ar keep it a pending booking and approve the booking from the admin portal. if this setting is enabled the client will only get a confimation email afrter approval. at the end of the booking client will only get a email saying that we cecive you booking. it is still pending. youwill get confimration email after the comapny approves the booking. just see wheter we can find a portal like stripe in sri lanka where the client can set up an account a link to that account via our plaform. that would be the easiest and the best choise for us.



> **Note:** so these setting should be aviala at the service level 1. can do pay later 2. does pay lter direclt create and appoinmoe or goes to pending appoinment and will become and appointment in providers shedule only after being approved by the admin or provider. i think this requires new database tables to have pending booking annd to track approval status and make a record in the appoint table or something similar once it is approved by the adminor provider.






6. **Confirmation** - Client sees:
   - Booking summary (service, provider, date, time, location)
   - Calendar invite download (.ics)
   - "Add to Google Calendar" button
   - Confirmation number
   - Reschedule/Cancel links

### 9.3 Client Account (Optional)
- If "Require client account" is enabled on the service:
  - Client must sign up / sign in before booking
  - Client gets a personal portal showing:
    - Upcoming bookings
    - Past bookings
    - Option to reschedule or cancel

> **Note:** if reigstration is required this changes client flow. he should adter slecting the date and time in the page /widget where the clinet enter deitals he should be prompted to give password and sign up or sign up using SSO and once the sign up is completed sent back to booking page to continue with the payment seamlessy and gracefully  

- If guest booking is allowed:
  - No account needed
  - Reschedule/cancel via links in confirmation email

> **Note:** if guest booking is allowed then at the end in the booking confimration page (this is after all payments are done or clinet slelct pay later option) the client should be requested to cretea profile by entering a password (beasue the name and email is already there ) or sign up using isngle sin on and if he registers he should be directl taken to the newly created client page.

> **Note:** i think i have added a story to create amigic page for the client to see detials of his appointmesnt and link to this shall be sent in the email. if the provdier calncels or added note or anything client can see the deuail in this page as wel and can cancel or reshedule through this page. i think this is temporary and standarb practive implemented by soome. just check if calandly does that and if this not too compicated lets have this feature.


### 9.4 Booking Page Customization
- Booking pages inherit company branding (logo, colours)
- Each service can have its own booking page or share a company-wide page
- Company-wide page: `yourcompany.scheduleapp.com` (lists all public services)
- Service-specific page: `yourcompany.scheduleapp.com/service-slug`

---

## 10. Reschedule & Cancellation Flow

### 10.1 Client-Initiated Reschedule
- Client clicks "Reschedule" from:
  - Confirmation email link
  - Client portal (if logged in)

> **Note:** or magic page apart form the above two options

- Client sees the same date/time picker with available slots
- Selects new time → confirmation
- **Notifications triggered:**
  - Client: Reschedule confirmation email
  - Provider: Reschedule notice
  - Admin (optional): Reschedule alert

### 10.2 Client-Initiated Cancellation
- Client clicks "Cancel" from:
  - Confirmation email link
  - Client portal (if logged in)
- If within cancellation policy window → cancellation blocked with message
- If outside policy window → cancellation proceeds
- Client confirms cancellation → slot freed
- **Refund logic** (if payment was collected):
  - Within full-refund window: automatic refund
  - Within partial-refund window: partial refund per policy
  - Outside refund window: no refund (configurable)
- **Notifications triggered:**
  - Client: Cancellation confirmation
  - Provider: Cancellation notice (slot freed)
  - Admin (optional): Cancellation alert

### 10.3 Provider-Initiated Reschedule
- Provider selects appointment → "Reschedule"
- Provider picks a new time from their own availability
- Client is notified with the new proposed time
- Options:
  - Client accepts → booking updated
  - Client rejects → original time stands or client can pick alternative

### 10.4 Provider-Initiated Cancellation
- Provider selects appointment → "Cancel"
- Provider gives reason (required)
- Client is notified immediately
- System suggests rebooking with:
  - Same provider at different time
  - Different provider at same time (if available)

### 10.5 Admin/Owner Cancellation
- Admin can cancel any appointment
- Same notification flow as provider-initiated
- Reason is logged for audit

---

> **Note:** fefund policy is bit comlicated since we are not using indivsual payments gateways. if we can do that its great . but if we can do that we need to figure out a way. i mean we are kind of using escrow payment method. so the refund policy is bit comlicated. i think we need to keep record of all payments and refund transactions and keep track of them. and a tab wahere the own or admincan easily check daily tranctions done through our protal and theur due balance, monthly and daily. 

## 11. Client Management (Owner/Admin View)

### 11.1 Clients Tab
- **Dedicated sidebar item** - Global view of all clients across all providers
- List shows:
  - Client name
  - Email
  - Phone (if provided)
  - Total bookings
  - Last booking date
  - Primary provider
  - Status (Active / Inactive based on recent activity)

### 11.2 Individual Client View
- Click a client → same slide-left detail pattern
- **Tabs:**
  1. **Details** - Contact info, account status, custom fields
  2. **Bookings** - Full history across all providers and services
  3. **Payments** - Payment history, outstanding balances, refunds
  4. **Communication** - Log of emails/SMS sent to this client

### 11.3 Client Filters & Search
- Search by name, email, or phone
- Filter by:
  - Service type
  - Provider
  - Booking recency (Active / Lapsed)
  - Booking count (New / Returning / Frequent)

---

## 12. Sidebar Navigation Structure

### Desktop Sidebar
```
[Company Logo]
─────────────────
Dashboard
Company
Team
Providers
Services
Clients
Notifications
Booking Pages
Reports
Settings
```
> **Note:** Dashboardand and serivces is only visble to the provider is he is an admin as well. Booking pages should be renamed as appoint ments and it should be the dhasboard for a provider. a tem meber / admin only sees this if he is providing a seriveA service provider sonesnt need to see settings. and what if we include company in the settings tab as a sub tab. Company settings tab will have compay info tab, payments sub tab, configuration sub tab  ect and ther will a nother main tab called account which included the relationship ow the owner and the company with the SAAS provider. and reports tab we will remove and have it in the dashborad tab and appointment sub tab . and if necesasy notification tab aslo can go as a sub tab in the comapny setting tab . what do you think..it seems like a logical order

### Mobile (Hamburger Menu)
Same items as desktop, rendered as a full-screen overlay menu when hamburger icon is tapped.

### Sidebar Visibility by Role
| Menu Item | Owner | Admin | Team Member | Provider |
|-----------|-------|-------|-------------|----------|
| Dashboard | Yes | Yes | Yes | Yes (own) |
| Company | Yes | Yes | No | No |
| Team | Yes | Yes | View only | No |
| Providers | Yes | Yes | Yes | No |
| Services | Yes | Yes | Yes | View own |
| Clients | Yes | Yes | Yes | Own only |
| Notifications | Yes | Yes | No | No |
| Booking Pages | Yes | Yes | No | No |
| Reports | Yes | Yes | Limited | No |
| Settings | Yes | Yes | Own profile | Own profile |
  
> **Note:** adjust the visibiltiy table according the table above
---

## 13. Key Business Rules Summary

1. **Provider lifecycle** - Providers are created as "Pending" on invitation, become "Active" only after accepting AND being assigned to at least one service
2. **Invitation-based onboarding** - Team members and providers join via email invitation only
3. **Role hierarchy** - Owner > Admin > Team Member > Provider

> **Note:** Critical. as at now there are no team mber and admin. they are interchangable and mean the same thing. team memebr has all the owner permission eceptt to delete comany, tema members, providers or services

4. **Private notes** - Provider's client notes are invisible to all other roles

 **Note:**note are only visiblie to the unique provider who created these notes and to no one eles. he can make them visibile to a respctive client for which he has appointment with as long as we ca provide flixibiltiy this can go for a future implemntation as well.
 
5. **Schedule conflicts** - System must detect and surface conflicts when assigning providers to services
6. **Consistent UX pattern** - List → Detail with slide animation across all sections
7. **Mobile tab limit** - Maximum 3 primary tabs visible; additional tabs via horizontal scroll or "More"
8. **Payment gating** - Paid services cannot accept bookings until payment gateway is connected
9. **Cancellation policy enforcement** - System respects per-service cancellation windows for client-initiated cancellations
10. **Schedule autonomy** - Provider schedule changes can be self-managed or require admin approval (configurable per provider)
11. **Notification defaults** - All critical notifications (confirmation, cancellation, reschedule) are enabled by default; follow-ups are opt-in


> **Note:** Overall comments

1. how is overall time setinng be when creatigna vailability shedules for service or service providers. should it be like 15 mins intervals aor should be let the owner decide it like 1o mins, 15 mins , whta is the common procatie and what is used by calandely. i dont thik setting down time for last minite or 5 mintse will make too many conflyscs so, 15 mis should be ideal 