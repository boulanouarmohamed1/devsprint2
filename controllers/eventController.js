const Event = require('../models/Event.js');
const fs = require('fs');
const { parse } = require('csv-parse');

const importEventsFromCSV = async (req, res) => {
    const results = [];
    const errors = [];

    if (!fs.existsSync('events.csv')) {
        return res.status(404).json({ message: 'The events.csv file could not be found on the server.' });
    }

    const saveToDatabase = async (events) => {
        try {
            await Event.deleteMany({});
            const savedEvents = await Event.insertMany(events);
            console.log(`Successfully saved ${savedEvents.length} events to the database`);
            return savedEvents;
        } catch (error) {
            console.error('Error saving to database:', error.message);
            throw new Error('Failed to save events to the database due to an internal error.');
        }
    };

    fs.createReadStream('events.csv')
        .pipe(parse({ 
            columns: true,
            skip_empty_lines: true, 
            trim: true 
        }))
        .on('data', (row) => {
            try {
                const requiredFields = ['title', 'description', 'date', 'location', 'responsible_person', 'status', 'type', 'duration'];
                for (const field of requiredFields) {
                    if (!row[field] || row[field].trim() === '') {
                        throw new Error(`The '${field}' field is missing or empty in a row. All fields must have a value.`);
                    }
                }

                const validStatuses = ['Upcoming', 'Cancelled', 'completed'];
                if (!validStatuses.includes(row.status)) {
                    throw new Error(`The status '${row.status}' is invalid. It must be one of: ${validStatuses.join(', ')}.`);
                }

                const parsedDate = new Date(row.date);
                if (isNaN(parsedDate.getTime())) {
                    throw new Error(`The date '${row.date}' is invalid. Please use a valid date format like YYYY-MM-DD.`);
                }

                const duration = parseFloat(row.duration);
                if (isNaN(duration) || duration <= 0) {
                    throw new Error(`The duration '${row.duration}' is invalid. It must be a positive number representing hours.`);
                }

                const event = {
                    title: row.title,
                    description: row.description,
                    date: parsedDate,
                    location: row.location,
                    responsible_person: row.responsible_person,
                    status: row.status,
                    type: row.type,
                    duration: duration
                };

                results.push(event);
            } catch (error) {
                errors.push(`Row failed validation: ${JSON.stringify(row)} - ${error.message}`);
            }
        })
        .on('end', async () => {
            console.log('JSON object from CSV:', JSON.stringify(results, null, 2));

            if (results.length === 0) {
                return res.status(404).json({ 
                    message: 'No valid events were found in the CSV file. All rows failed validation.',
                    errors: errors.length > 0 ? errors : ['No specific errors captured; please check the CSV format.']
                });
            }

            try {
                await saveToDatabase(results);
                if (errors.length > 0) {
                    res.status(200).json({
                        message: `Successfully saved ${results.length} events to the database. However, ${errors.length} rows failed validation.`,
                        data: results,
                        errors
                    });
                } else {
                    res.status(200).json({ message: 'All events from the CSV were successfully saved to the database.', data: results });
                }
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        })
        .on('error', (error) => {
            res.status(500).json({ message: 'An error occurred while reading the CSV file. Please ensure it’s correctly formatted.', error: error.message });
        });
};

const createEvent = async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'The event data is invalid. Please check the following issues:', 
                errors: messages 
            });
        }
        res.status(500).json({ message: 'An unexpected error occurred while creating the event.', error: error.message });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'An unexpected error occurred while fetching events.', error: error.message });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'No event was found with the provided ID.' });
        }
        res.status(200).json(event);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'The event ID provided is invalid. Please use a valid 24-character hexadecimal ID.' });
        }
        res.status(500).json({ message: 'An unexpected error occurred while fetching the event.', error: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!event) {
            return res.status(404).json({ message: 'No event was found with the provided ID to update.' });
        }
        res.status(200).json(event);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'The updated event data is invalid. Please check the following issues:', 
                errors: messages 
            });
        } else if (error.name === 'CastError') {
            return res.status(400).json({ message: 'The event ID provided is invalid. Please use a valid 24-character hexadecimal ID.' });
        }
        res.status(500).json({ message: 'An unexpected error occurred while updating the event.', error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'No event was found with the provided ID to delete.' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'The event ID provided is invalid. Please use a valid 24-character hexadecimal ID.' });
        }
        res.status(500).json({ message: 'An unexpected error occurred while deleting the event.', error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 0
        });
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error.message);
        res.status(500).json({ message: 'An unexpected error occurred while logging out.', error: error.message });
    }
};

module.exports = {
    importEventsFromCSV,
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    logout
};