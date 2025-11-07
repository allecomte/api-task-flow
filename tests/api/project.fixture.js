const { Types } = require("mongoose");

const projects = [
    {
        id: new Types.ObjectId(),
        title: "Project One",
        description: "Description for Project One",
        startAt: "2025-10-01T00:00:00.000Z",
        endAt: "2026-03-31T00:00:00.000Z"
    },
    {
        id: new Types.ObjectId(),
        title: "Project Two",
        description: "Description for Project Two",
        startAt: "2026-01-01T00:00:00.000Z",
        endAt: "2026-06-30T00:00:00.000Z"
    },
    {
        id: new Types.ObjectId(),
        title: "Project Three",
        description: "Description for Project Three",
        startAt: "2025-12-01T00:00:00.000Z",
        endAt: "2026-05-31T00:00:00.000Z"
    },
];

module.exports = { projects };