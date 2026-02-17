import axios from 'axios';
import { getConfig } from './config.js';

const BASE_URL = 'https://platform.climate.com';

function getClient() {
  const apiKey = getConfig('apiKey');
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    if (status === 401) throw new Error('Authentication failed. Check your API key.');
    if (status === 403) throw new Error('Access forbidden. Check your API permissions.');
    if (status === 404) throw new Error('Resource not found.');
    if (status === 429) throw new Error('Rate limit exceeded. Please wait before retrying.');
    const message = data?.message || data?.error || JSON.stringify(data);
    throw new Error(`API Error (${status}): ${message}`);
  } else if (error.request) {
    throw new Error('No response from Climate FieldView API. Check your internet connection.');
  } else {
    throw error;
  }
}

// ============================================================
// FIELDS
// ============================================================

export async function listFields({ limit = 50 } = {}) {
  const client = getClient();
  try {
    const response = await client.get('/v4/fields', { params: { limit } });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getField(fieldId) {
  const client = getClient();
  try {
    const response = await client.get(`/v4/fields/${fieldId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function createField({ name, acres, boundary } = {}) {
  const client = getClient();
  try {
    const body = {
      name,
      ...(acres && { acres }),
      ...(boundary && { boundary })
    };
    const response = await client.post('/v4/fields', body);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// FARMS
// ============================================================

export async function listFarms({ limit = 50 } = {}) {
  const client = getClient();
  try {
    const response = await client.get('/v4/farms', { params: { limit } });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getFarm(farmId) {
  const client = getClient();
  try {
    const response = await client.get(`/v4/farms/${farmId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// BOUNDARIES
// ============================================================

export async function listBoundaries({ limit = 50 } = {}) {
  const client = getClient();
  try {
    const response = await client.get('/v4/boundaries', { params: { limit } });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getBoundary(boundaryId) {
  const client = getClient();
  try {
    const response = await client.get(`/v4/boundaries/${boundaryId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// HARVEST ACTIVITIES
// ============================================================

export async function listHarvestActivities({ limit = 50 } = {}) {
  const client = getClient();
  try {
    const response = await client.get('/v4/activitySummaries/harvest', { params: { limit } });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getHarvestActivity(activityId) {
  const client = getClient();
  try {
    const response = await client.get(`/v4/activitySummaries/harvest/${activityId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// PLANTING ACTIVITIES
// ============================================================

export async function listPlantingActivities({ limit = 50 } = {}) {
  const client = getClient();
  try {
    const response = await client.get('/v4/activitySummaries/planting', { params: { limit } });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getPlantingActivity(activityId) {
  const client = getClient();
  try {
    const response = await client.get(`/v4/activitySummaries/planting/${activityId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}
