# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

ClarityLab is an investor-ready diagnostics/LIMS (Laboratory Information Management System) web application designed for labs that need a modern website with a secure client portal. The application will include:

- Test catalog management
- Order processing and tracking
- Sample tracking throughout the lab workflow
- Result PDF generation and delivery
- Administrative controls and user management
- All integrated into a single technology stack

## Architecture Guidelines

### Core Components (Planned)
- **Frontend**: Modern web interface for both public-facing website and secure client portal
- **Backend API**: RESTful API for handling lab operations, orders, and data management
- **Database**: Secure storage for lab data, test results, client information, and audit trails
- **Authentication**: Multi-role authentication system (clients, lab staff, administrators)
- **Document Generation**: PDF generation system for test results and reports
- **File Storage**: Secure storage for sample images, documents, and generated reports

### Key Architectural Considerations
- **HIPAA Compliance**: Ensure all health data handling meets healthcare privacy requirements
- **Audit Trail**: Complete tracking of all data changes for regulatory compliance
- **Role-Based Access**: Different access levels for clients, lab technicians, and administrators
- **Sample Chain of Custody**: Full tracking of sample lifecycle from receipt to disposal
- **Integration Ready**: APIs for potential integration with lab equipment and external systems

## Development Setup

This project is currently in initial planning phase. When development begins, typical commands might include:

```bash
# Project initialization (technology stack to be determined)
# Could be Node.js/React, Python/Django, or similar modern web stack

# Install dependencies
npm install  # or pip install -r requirements.txt

# Start development server
npm run dev  # or python manage.py runserver

# Run tests
npm test    # or pytest

# Build for production
npm run build  # or python manage.py collectstatic

# Database migrations (when using frameworks like Django, Rails, etc.)
# python manage.py migrate or similar
```

## Security Considerations

- Implement proper input validation and sanitization
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data at rest and in transit
- Implement proper session management
- Regular security audits and dependency updates
- Consider OWASP Top 10 vulnerabilities in all development

## Compliance Requirements

- **HIPAA**: Health Insurance Portability and Accountability Act compliance for handling PHI
- **CLIA**: Clinical Laboratory Improvement Amendments compliance for lab operations
- **FDA**: Potential FDA regulations depending on test types
- **State Regulations**: Various state-specific lab licensing and reporting requirements

## Development Workflow

Since this is a greenfield project:

1. **Technology Stack Selection**: Choose appropriate frameworks and technologies
2. **Database Schema Design**: Design normalized schema for lab operations
3. **API Design**: RESTful API design for all system operations
4. **UI/UX Design**: User experience design for different user roles
5. **Security Implementation**: Authentication, authorization, and data protection
6. **Testing Strategy**: Unit tests, integration tests, and security testing
7. **Deployment Strategy**: Production deployment with proper monitoring

## Repository Information

- **GitHub**: https://github.com/Swimhack/claritylab.git
- **Current Status**: Initial planning phase with README.md only
- **Branches**: 
  - `main`: Current stable branch
  - Various Copilot branches may exist for automated development assistance