const mockTimetable = [
    {
        name: "Mathematics",
        topics: ["Algebra", "Calculus", "Geometry"],
        priority: 1,
        examDate: new Date("2023-12-15"),
        difficulty: 4,
        lengthLevel: "Moderate",
        allocatedHours: 5
    },
    {
        name: "Physics",
        topics: ["Mechanics", "Thermodynamics", "Optics"],
        priority: 2,
        examDate: new Date("2023-12-20"),
        difficulty: 3,
        lengthLevel: "Brief",
        allocatedHours: 3
    },
    {
        name: "Chemistry",
        topics: ["Organic", "Inorganic", "Physical"],
        priority: 3,
        examDate: new Date("2023-12-22"),
        difficulty: 5,
        lengthLevel: "Extensive",
        allocatedHours: 4
    },
    {
        name: "Biology",
        topics: ["Cell Biology", "Genetics", "Ecology"],
        priority: 4,
        examDate: new Date("2023-12-25"),
        difficulty: 2,
        lengthLevel: "Moderate",
        allocatedHours: 2
    }
];

export default mockTimetable;