const schemeModel = require('../models/scheme');

class SchemeService {
    async getAllSchemes() {
        try {
            return await schemeModel.find().sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error fetching schemes:', error);
            throw error;
        }
    }

    async getSchemeById(id) {
        try {
            return await schemeModel.findById(id);
        } catch (error) {
            console.error('Error fetching scheme:', error);
            throw error;
        }
    }

    async createScheme(schemeData) {
        try {
            const scheme = new schemeModel(schemeData);
            return await scheme.save();
        } catch (error) {
            console.error('Error creating scheme:', error);
            throw error;
        }
    }

    async updateScheme(id, schemeData) {
        try {
            return await schemeModel.findByIdAndUpdate(id, schemeData, { new: true });
        } catch (error) {
            console.error('Error updating scheme:', error);
            throw error;
        }
    }

    async deleteScheme(id) {
        try {
            return await schemeModel.findByIdAndDelete(id);
        } catch (error) {
            console.error('Error deleting scheme:', error);
            throw error;
        }
    }
}

module.exports = new SchemeService(); 