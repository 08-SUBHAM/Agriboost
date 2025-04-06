const axios = require('axios');
require('dotenv').config();

class DiseaseDetectionService {
    constructor() {
        this.apiKey = process.env.PLANT_ID_API_KEY;
        this.apiUrl = 'https://api.plant.id/v2/identify';
    }

    async detectDisease(imageBuffer) {
        try {
            const response = await axios.post(this.apiUrl, {
                images: [imageBuffer.toString('base64')],
                plant_details: ['diseases']
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': this.apiKey
                }
            });

            return this.processResponse(response.data);
        } catch (error) {
            console.error('Error in disease detection:', error);
            throw error;
        }
    }

    processResponse(data) {
        // Process and format the response
        // Add your response processing logic here
        return data;
    }

    getTreatmentRecommendations(diseaseName) {
        // This is a simple mapping of common diseases to treatments
        const treatments = {
            'Leaf Blast': 'Apply fungicide and ensure proper spacing between plants',
            'Brown Spot': 'Improve soil fertility and maintain proper moisture levels',
            'Bacterial Leaf Blight': 'Use disease-free seeds and practice crop rotation',
            'Sheath Blight': 'Apply appropriate fungicide and maintain field hygiene',
            'Bakanae': 'Use disease-free seeds and practice seed treatment'
        };

        return treatments[diseaseName] || 'Consult with a local agricultural expert for specific treatment recommendations.';
    }
}

module.exports = new DiseaseDetectionService(); 