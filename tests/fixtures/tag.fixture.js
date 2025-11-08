const { Types } = require("mongoose");

const tags = [
    {
        id: new Types.ObjectId(),
        name: "Tag One"
    },
    {
        id: new Types.ObjectId(),
        name: "Tag Two"
    },
    {
        id: new Types.ObjectId(),
        name: "Tag Three"
    },
];

module.exports = { tags };