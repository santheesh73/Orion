import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
        }}
      >
        <svg width="350" height="350" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="50" rx="26" ry="35" fill="none" stroke="#ef4444" strokeWidth="14" />
          <ellipse cx="50" cy="50" rx="46" ry="14" transform="rotate(-30 50 50)" fill="none" stroke="#ef4444" strokeWidth="3" />
          <circle cx="89.8" cy="27" r="5" fill="#ef4444" />
          <circle cx="10.2" cy="73" r="5" fill="#ef4444" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
