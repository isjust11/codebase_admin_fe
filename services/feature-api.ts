import axios from 'axios';
import axiosApi from './base/api';

export const featureService = {

  async getFeatures() {
    try {
      const response = await axiosApi.get(`feature`);
      return response.data;
    } catch (error) {
      console.error('Error fetching features:', error);
      // Ném lỗi để component gọi API có thể xử lý
      throw error;
    }
  },

  async createFeature(featureData: any) {
    try {
      const response = await axiosApi.post(`feature`, featureData);
      return response.data;
    } catch (error) {
      console.error('Error creating menu:', error);
      throw error;
    }
  },
  
  async updateFeature(id: number, featureData: any) {
    try {
      const response = await axiosApi.put(`feature/${id}`, featureData);
      return response.data;
    } catch (error) {
      console.error('Error updating menu:', error);
      throw error;
    }
  },
  
  async deleteFeature(id: number) {
    try {
      await axiosApi.delete(`feature/${id}`);
    } catch (error) {
      console.error('Error deleting feature:', error);
      throw error;
    }
  }
}