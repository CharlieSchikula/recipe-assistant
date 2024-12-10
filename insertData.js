import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Substitute from './models/Substitute.js'; // Ensure the file extension is included

dotenv.config(); // Load environment variables from .env file

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Sample data to insert
    const sampleData = [
      {
        ingredient: '茄子',
        substitutes: [
          { originalPortion: '100g', substituteName: 'ズッキーニ', substitutePortion: '100g', vegetarian: true },
          { originalPortion: '100g', substituteName: 'パプリカ', substitutePortion: '100g', vegetarian: true }
        ]
      },
      {
        ingredient: '豆板醬 / 豆板醤 / 豆瓣醬',
        substitutes: [
          { originalPortion: '大さじ1', substituteName: '味噌、醤油、一味唐辛子', substitutePortion: 'それぞれ 大さじ1、小さじ1/2、一味唐辛子小さじ1', vegetarian: true }
        ]
      },
      {
        ingredient: '醤油 / しょうゆ / 醬油',
        substitutes: [
          { originalPortion: '大さじ１', substituteName: 'ナンプラー', substitutePortion: '大さじ１', vegetarian: false }
        ]
      },
      {
        ingredient: '片栗粉',
        substitutes: [
          { originalPortion: '大さじ１', substituteName: '米粉', substitutePortion: '大さじ１', vegetarian: true },
          { originalPortion: '大さじ１', substituteName: 'コーンスターチ', substitutePortion: '大さじ１', vegetarian: true }
        ]
      },
      {
        ingredient: 'バター / マーガリン',
        substitutes: [
          { originalPortion: '10g', substituteName: 'オリーブオイル', substitutePortion: '6ml', vegetarian: true }
        ]
      },
      {
        ingredient: '豆乳',
        substitutes: [
          { originalPortion: '100ml', substituteName: '牛乳', substitutePortion: '100ml', vegetarian: false }
        ]
      },
      {
        ingredient: 'コンソメ / コンソメ顆粒',
        substitutes: [
          { originalPortion: '大さじ１', substituteName: '鶏ガラスープの素', substitutePortion: '大さじ１', vegetarian: false }
        ]
      },
      {
        ingredient: '薄力粉',
        substitutes: [
          { originalPortion: '大さじ１', substituteName: '米粉', substitutePortion: '大さじ１', vegetarian: true }
        ]
      },
      {
        ingredient: 'だしの素 / 和風だしの素',
        substitutes: [
          { originalPortion: '大さじ１', substituteName: 'めんつゆ', substitutePortion: '大さじ１', vegetarian: false },
          { originalPortion: '大さじ１', substituteName: '白だし', substitutePortion: '大さじ１', vegetarian: false }
        ]
      },
      {
        ingredient: '味噌 / お味噌',
        substitutes: [
          { originalPortion: '30g', substituteName: '豆腐＋醤油（ペースト状にすりつぶす）', substitutePortion: 'それぞれ30g、大さじ１', vegetarian: true }
        ]
      },
      {
        ingredient: 'サラダ油',
        substitutes: [
          { originalPortion: '大さじ１', substituteName: 'オリーブオイル', substitutePortion: '大さじ１', vegetarian: true }
        ]
      },
      {
        ingredient: 'ゴマ油 / ごま油 / 胡麻油',
        substitutes: [
          { originalPortion: '大さじ１', substituteName: 'サラダ油＋すりごま（ラー油も可）', substitutePortion: '大さじ１', vegetarian: true },
          { originalPortion: '大さじ１', substituteName: 'オリーブオイル＋すりごま（ラー油も可）', substitutePortion: '大さじ１', vegetarian: true }
        ]
      },
      {
        ingredient: '酢 / お酢',
        substitutes: [
          { originalPortion: '大さじ１', substituteName: 'レモン果汁', substitutePortion: '大さじ１', vegetarian: true }
        ]
      },
      {
        ingredient: 'みりん',
        substitutes: [
          { originalPortion: '大さじ１', substituteName: '日本酒＋砂糖', substitutePortion: 'それぞれ大さじ１、小さじ１', vegetarian: true }
        ]
      },
      {
        ingredient: '大根',
        substitutes: [
          { originalPortion: '100g', substituteName: 'かぶ', substitutePortion: '100g', vegetarian: true }
        ]
      },
      {
        ingredient: '羅漢果 / ラカンカ / ラカント',
        substitutes: [
          { originalPortion: '100g', substituteName: 'かぶ', substitutePortion: '100g', vegetarian: true }
        ]
      }
    ];

    // Insert data
    Substitute.insertMany(sampleData)
      .then(() => {
        console.log('Data inserted successfully');
        mongoose.connection.close(); // Close the connection after insertion
      })
      .catch(err => {
        console.error('Error inserting data', err);
        mongoose.connection.close(); // Close the connection on error
      });
  })
  .catch(err => console.error('Could not connect to MongoDB', err));