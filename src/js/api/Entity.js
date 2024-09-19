import createRequest from './createRequest';


export default class Entity {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async list() {
    try {
      const response = await createRequest({
        url: `${this.baseUrl}`,
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching list:', error);
      throw error;
    }
  }

  async get(id) {
    try {
      const response = await createRequest({
        url: `${this.baseUrl}/${id}`,
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const response = await createRequest({
        url: `${this.baseUrl}/new-user`,
        method: 'POST',
        data,
      });
      return response;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await createRequest({
        url: `${this.baseUrl}/${id}`,
        method: 'PUT',
        data,
      });
      return response;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await createRequest({
        url: `${this.baseUrl}/${id}`,
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }
}