/**
 * Open Graph Image Generation for Farcaster Frames
 * Uses @vercel/og to generate dynamic images
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: VercelRequest) {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 40,
            }}
          >
            <div
              style={{
                fontSize: 80,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 20,
              }}
            >
              🔮 Seti
            </div>
            <div
              style={{
                fontSize: 40,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: 40,
              }}
            >
              Prediction Markets on Base
            </div>
            <div
              style={{
                display: 'flex',
                gap: 40,
                marginTop: 40,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: 30,
                  width: 200,
                }}
              >
                <div style={{ fontSize: 60 }}>📊</div>
                <div style={{ fontSize: 24, color: 'white', marginTop: 15 }}>
                  Browse Markets
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: 30,
                  width: 200,
                }}
              >
                <div style={{ fontSize: 60 }}>🎯</div>
                <div style={{ fontSize: 24, color: 'white', marginTop: 15 }}>
                  Place Bets
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: 30,
                  width: 200,
                }}
              >
                <div style={{ fontSize: 60 }}>💰</div>
                <div style={{ fontSize: 24, color: 'white', marginTop: 15 }}>
                  Win Rewards
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.8)',
                marginTop: 60,
              }}
            >
              Built on Base ⛓️ | Powered by Farcaster 🟪
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG image error:', error);
    return new Response('Error generating image', { status: 500 });
  }
}

