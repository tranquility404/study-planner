# Study Planner

## Overview
The Study Planner project is a web application designed to help users allocate their study hours effectively across various subjects. It provides a user-friendly interface for managing subjects, prioritizing them, and visualizing the allocated study hours in a timetable format.

## Features
- **Priority Allocation**: Users can allocate hours to different subjects based on their priority and remaining hours.
- **Drag-and-Drop Functionality**: Subjects can be reordered using drag-and-drop to adjust their priority dynamically.
- **Timetable Display**: A visual representation of the allocated hours for each subject is provided in a timetable format.

## Components
- **PriorityAllocation**: A component that manages the allocation of study hours to subjects. It includes state management for subjects, remaining hours, and error messages.
- **Timetable**: A component that displays a timetable using dummy data, rendering a table or grid layout to show the allocated hours for each subject.

## Types
- **Subject Interface**: Defines the structure of a subject object, including properties such as `name`, `topics`, `priority`, `examDate`, `difficulty`, `lengthLevel`, and `allocatedHours`.

## Data
- **Mock Timetable**: Contains dummy data for the timetable, providing sample subjects with allocated hours for display in the Timetable component.

## Installation
To install the project dependencies, run:
```
npm install
```

## Usage
To start the development server, run:
```
npm start
```

## License
This project is licensed under the MIT License.