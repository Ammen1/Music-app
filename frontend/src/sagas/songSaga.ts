import { call, all, put, takeEvery } from 'redux-saga/effects';
import axios from 'axios';
import {
  fetchSongsStart,
  fetchSongsSuccess,
  fetchSongsFailure,
  addSongStart,
  addSongSuccess,
  addSongFailure,
  updateSongStart,
  updateSongSuccess,
  updateSongFailure,
  deleteSongStart,
  deleteSongSuccess,
  deleteSongFailure,
  fetchStatisticsStart,
  fetchStatisticsSuccess,
  fetchStatisticsFailure,
} from '../features/songSlice';

const BASE_URL = 'https://test-project-wt7s.onrender.com/api/songs';

// Generic API call handler
function* apiCall(method: string, url: string, data?: unknown) {
  try {
    const response = yield call(axios, { method, url, data });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

// Fetch Songs
function* fetchSongsSaga() {
  try {
    const data = yield call(apiCall, 'GET', `${BASE_URL}/songs`);
    if (data.success && Array.isArray(data.songs)) {
      yield put(fetchSongsSuccess(data.songs));
    } else {
      yield put(fetchSongsFailure('Failed to fetch songs'));
    }
  } catch (error: any) {
    yield put(fetchSongsFailure(error.message));
  }
}

// Add Song
function* addSongSaga(action: { type: string; payload: Song }) {
  try {
    const data = yield call(apiCall, 'POST', `${BASE_URL}/create_songs`, action.payload);
    if (data.success && data.song) {
      yield put(addSongSuccess(data.song));
    } else {
      yield put(addSongFailure('Failed to add song'));
    }
  } catch (error: any) {
    yield put(addSongFailure(error.message));
  }
}

// Update Song
function* updateSongSaga(action: { type: string; payload: Song }) {
  try {
    const data = yield call(apiCall, 'PUT', `${BASE_URL}/songs/${action.payload._id}`, action.payload);
    if (data.success && data.song) {
      yield put(updateSongSuccess(data.song));
    } else {
      yield put(updateSongFailure('Failed to update song'));
    }
  } catch (error: any) {
    yield put(updateSongFailure(error.message));
  }
}

// Delete Song
function* deleteSongSaga(action: { type: string; payload: string }) {
  try {
    const data = yield call(apiCall, 'DELETE', `${BASE_URL}/songs/${action.payload}`);
    if (data.success) {
      yield put(deleteSongSuccess(action.payload));
    } else {
      yield put(deleteSongFailure('Failed to delete song'));
    }
  } catch (error: any) {
    yield put(deleteSongFailure(error.message));
  }
}

// Fetch Statistics
function* fetchStatisticsSaga() {
  try {
    const data = yield call(apiCall, 'GET', `${BASE_URL}/songs/statistics`);
    if (data) {
      yield put(fetchStatisticsSuccess(data));
    } else {
      yield put(fetchStatisticsFailure('Failed to fetch statistics'));
    }
  } catch (error: any) {
    yield put(fetchStatisticsFailure(error.message));
  }
}

// Watcher Sagas
function* watchFetchSongs() {
  yield takeEvery(fetchSongsStart.type, fetchSongsSaga);
}

function* watchAddSong() {
  yield takeEvery(addSongStart.type, addSongSaga);
}

function* watchUpdateSong() {
  yield takeEvery(updateSongStart.type, updateSongSaga);
}

function* watchDeleteSong() {
  yield takeEvery(deleteSongStart.type, deleteSongSaga);
}

function* watchFetchStatistics() {
  yield takeEvery(fetchStatisticsStart.type, fetchStatisticsSaga);
}

// Root Saga
export default function* rootSaga() {
  yield all([
    watchFetchSongs(),
    watchAddSong(),
    watchUpdateSong(),
    watchDeleteSong(),
    watchFetchStatistics(),
  ]);
}
