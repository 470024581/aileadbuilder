# AI Lead Builder

An intelligent lead management and LinkedIn message generation platform built with Next.js 15, React 19, and AI-powered content creation.

## 🚀 Features

### Lead Management
- **Create & Edit Leads**: Add new leads with name, role, company, and LinkedIn profile
- **Bulk Operations**: Select multiple leads for bulk message generation and CSV export
- **Delete Leads**: Remove leads and all associated messages with confirmation
- **LinkedIn Integration**: Direct links to LinkedIn profiles for easy access

### AI-Powered Message Generation
- **Smart Message Creation**: Generate personalized LinkedIn messages using OpenAI
- **Individual Generation**: Create messages for specific leads with real-time feedback
- **Bulk Generation**: Generate messages for multiple leads with progress tracking
- **Message Regeneration**: Recreate content for existing messages with one click

### Message Management System
- **Kanban Board Interface**: Visual drag-and-drop message management
- **Status Workflow**: Track messages through Draft → Approved → Sent pipeline
- **Message Editing**: Full CRUD operations with real-time updates
- **Progress Tracking**: Visual progress indicators for all operations

### Modern User Experience
- **Toast Notifications**: Modern, dismissible notifications for all actions
- **Loading States**: Visual feedback for all async operations
- **Optimistic Updates**: Immediate UI updates with error rollback
- **Responsive Design**: Mobile-friendly interface with modern styling
- **Confirmation Dialogs**: Safe deletion with modern modal confirmations

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Shadcn/ui** - Modern, accessible UI components
- **Lucide React** - Beautiful icons
- **@dnd-kit** - Drag and drop functionality
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation

### Backend & Database
- **Supabase** - PostgreSQL database with real-time features
- **OpenAI API** - AI-powered message generation
- **Next.js API Routes** - Server-side API endpoints

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Git** - Version control

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aileadbuilder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # APP Configuration
   NEXT_PUBLIC_APP_NAME="AI Lead Builder"
   NEXT_PUBLIC_APP_DESCRIPTION="AI-powered outreach workflow tool"
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Database Setup**
   Run the SQL script in your Supabase SQL Editor:
   ```bash
   # Execute the contents of database.sql in Supabase
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄 Database Schema

### Tables

#### `leads`
- `id` (UUID, Primary Key)
- `name` (Text, Required)
- `role` (Text, Required) 
- `company` (Text, Required)
- `linkedin_url` (Text, Optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `messages`
- `id` (UUID, Primary Key)
- `lead_id` (UUID, Foreign Key → leads.id)
- `content` (Text, Required)
- `status` (Enum: 'draft', 'approved', 'sent')
- `generated_at` (Timestamp)
- `updated_at` (Timestamp)

### Relationships
- One-to-Many: Lead → Messages
- Cascade Delete: Deleting a lead removes all associated messages

## 🎯 Usage Guide

### Managing Leads

1. **Add New Lead**
   - Click "Add Lead" button
   - Fill in required information (name, role, company)
   - Optionally add LinkedIn profile URL
   - Save to create the lead

2. **Edit Existing Lead**
   - Click "Edit" button in the Actions column
   - Modify any field in the form
   - Save changes to update

3. **Delete Lead**
   - Click the trash icon in the Actions column
   - Confirm deletion in the modal
   - Lead and all messages will be permanently removed

### Message Generation

1. **Individual Message Generation**
   - Click "Generate" button for a specific lead
   - AI will create a personalized LinkedIn message
   - Message appears in the Draft column of the Kanban board

2. **Bulk Message Generation**
   - Select multiple leads using checkboxes
   - Click "Generate Messages (X)" button
   - Monitor progress in the real-time progress dialog
   - View results with success/failure indicators

3. **Message Regeneration**
   - Click "Regenerate" button on any existing message
   - AI will create new content for the same lead
   - Original message is updated with new content

### Message Workflow

1. **Draft Status**
   - Newly generated messages start here
   - Edit content as needed
   - Review before approval

2. **Approved Status**
   - Drag message from Draft to Approved
   - Indicates message is ready to send
   - Can still edit if needed

3. **Sent Status**
   - Drag message from Approved to Sent
   - Indicates message has been sent to the lead
   - Represents completed outreach

### Data Export

1. **CSV Export**
   - Select leads using checkboxes
   - Click "Export CSV (X)" button
   - Download includes lead details and all associated messages
   - File automatically downloaded to your device

## 🔧 API Endpoints

### Leads API
- `GET /api/leads` - List all leads
- `POST /api/leads` - Create new lead
- `GET /api/leads/[id]` - Get specific lead
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead and associated messages

### Messages API
- `GET /api/messages` - List all messages with lead information
- `POST /api/messages` - Create new message
- `GET /api/messages/[id]` - Get specific message
- `PATCH /api/messages/[id]` - Update message (partial)
- `PUT /api/messages/[id]` - Update message (full)
- `DELETE /api/messages/[id]` - Delete message

### AI Generation API
- `POST /api/generate-message` - Generate AI message for a lead

## 🎨 UI Components

### Core Components
- **LeadForm** - Lead creation and editing
- **MessageForm** - Message editing
- **MessageKanbanBoard** - Drag-and-drop message management
- **Toast System** - Modern notifications
- **Progress Dialog** - Bulk operation progress tracking
- **Confirmation Dialogs** - Safe deletion confirmation

### UI Library
Built on Shadcn/ui components:
- Button, Dialog, Card, Badge
- Form, Input, Select, Checkbox
- Progress, Loader indicators
- Modern, accessible design system

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
Ensure all environment variables are set in your production environment:
- Supabase URL and API keys
- OpenAI API key
- Any additional configuration

### Recommended Platforms
- **Vercel** - Optimal for Next.js applications
- **Netlify** - Alternative deployment platform
- **Docker** - Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for AI-powered message generation
- **Supabase** for backend infrastructure
- **Shadcn/ui** for beautiful UI components
- **Vercel** for hosting and deployment platform

---

**AI Lead Builder** - Streamlining LinkedIn outreach with intelligent automation 🚀 