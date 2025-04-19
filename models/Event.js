const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
title: {
type: String,
required: true
},
description: {
type: String,
required: true
},
date: {
type: Date,
required: true
},
location: {
type: String,
required: true
},
responsible_person: {
type: String,
required: true
},
status: {
type: String,
required: true,
enum: ['Upcoming', 'Cancelled', 'completed'] // you can customize the statuses
},
type: {
type: String,
required: true
},
duration: {
type: Number, // duration in hours or minutes (you decide)
required: true
}
});

module.exports = mongoose.model('Event', eventSchema);