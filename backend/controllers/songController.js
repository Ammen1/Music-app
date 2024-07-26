import express from 'express';
import Song from '../models/Song.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncError.js';
import ErrorHandler from "../middlewares/error.js";

// Create a new song
export const createSong = catchAsyncErrors(async (req, res, next) => {
  const { title, artist, album, genre } = req.body;

  if (!title || !artist || !album || !genre) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  try {
    const newSong = await Song.create({ title, artist, album, genre });

    res.status(201).json({
      success: true,
      song: newSong
    });
  } catch (error) {
    next(error);
  }
});


// Get all songs with optional filtering
export const getAllSongs = catchAsyncErrors(async (req, res, next) => {
  const { genre, artist, album, title } = req.query;
  const query = {};
  if (genre) {
    query.genre = genre;
  }
  if (artist) {
    query.artist = artist;
  }
  if (album) {
    query.album = album;
  }
  if (title) {
    query.title = title;
  }

  const songs = await Song.find(query);

  res.status(200).json({
    success: true,
    count: songs.length,
    songs
  });
});

// Get a single song by ID
export const getSongById = catchAsyncErrors(async (req, res, next) => {
  const song = await Song.findById(req.params.id);

  if (!song) {
    return next(new ErrorHandler("Song not found", 404));
  }

  res.status(200).json({
    success: true,
    song
  });
});

// Update a song by ID
export const updateSong = catchAsyncErrors(async (req, res, next) => {
  const { title, artist, album, genre } = req.body;

  const song = await Song.findByIdAndUpdate(
    req.params.id,
    { title, artist, album, genre },
    { new: true, runValidators: true }
  );

  if (!song) {
    return next(new ErrorHandler("Song not found", 404));
  }

  res.status(200).json({
    success: true,
    song
  });
});

// Delete a song by ID
export const deleteSong = catchAsyncErrors(async (req, res, next) => {
  const song = await Song.findByIdAndDelete(req.params.id);

  if (!song) {
    return next(new ErrorHandler("Song not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Song deleted successfully"
  });
});


export const getSongStatistics = catchAsyncErrors(async (req, res, next) => {
  try {
    // Total counts
    const totalSongs = await Song.countDocuments({});
    const totalArtists = (await Song.distinct('artist')).length;
    const totalAlbums = (await Song.distinct('album')).length;
    const totalGenres = (await Song.distinct('genre')).length;

    // Aggregation for counts
    const genreCounts = await Song.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $project: { _id: 0, genre: '$_id', count: 1 } }
    ]);

    const artistSongCounts = await Song.aggregate([
      { $group: { _id: '$artist', count: { $sum: 1 } } },
      { $project: { _id: 0, artist: '$_id', count: 1 } }
    ]);

    const albumSongCounts = await Song.aggregate([
      { $group: { _id: '$album', count: { $sum: 1 } } },
      { $project: { _id: 0, album: '$_id', count: 1 } }
    ]);

    res.json({
      totalSongs,
      totalArtists,
      totalAlbums,
      totalGenres,
      genreCounts,
      artistSongCounts,
      albumSongCounts,
    });
  } catch (error) {
    next(error);
  }
});
