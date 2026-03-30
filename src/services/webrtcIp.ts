const DEBUG = false;

function debug(...args: unknown[]) {
  if (DEBUG) console.log('[WebRTC]', ...args);
}

// Public STUN servers
const STUN_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
];

interface CandidateInfo {
  ip: string;
  type: 'host' | 'srflx' | 'prflx' | 'relay';
}

function isPublicIP(ip: string): boolean {
  if (ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.16.') ||
      ip.startsWith('172.31.') ||
      ip.startsWith('127.') ||
      ip === '0.0.0.0' ||
      ip === '::1' ||
      ip.startsWith('fc00:') ||
      ip.startsWith('fe80:') ||
      ip.startsWith('fd')) {
    return false;
  }
  return true;
}

function extractIPFromCandidate(candidateString: string): { ip: string; type: string } | null {
  const parts = candidateString.split(' ');
  const typeIndex = parts.indexOf('typ');

  if (typeIndex === -1) return null;

  const type = parts[typeIndex + 1];

  // Find IP address in candidate parts (skip 'raddr' related IPs)
  const raddrIndex = parts.indexOf('raddr');
  let startIndex = typeIndex + 2;

  // If raddr exists, the next part after it is the related address, skip to after that
  if (raddrIndex !== -1 && raddrIndex > typeIndex) {
    startIndex = raddrIndex + 2;
  }

  for (let i = startIndex; i < parts.length; i++) {
    const part = parts[i];
    if (/^\d+\.\d+\.\d+\.\d+$/.test(part)) {
      if (isPublicIP(part)) {
        return { ip: part, type };
      }
    }
  }

  return null;
}

/**
 * Get public IP using WebRTC STUN
 * This returns the actual egress IP that would be used for external connections,
 * which may differ from the direct IP if using a VPN/proxy
 */
export async function getPublicIP(): Promise<CandidateInfo | null> {
  debug('Starting STUN request...');
  return new Promise((resolve) => {
    const pc = new RTCPeerConnection({
      iceServers: STUN_SERVERS.map((url) => ({ urls: url })),
    });

    const timeout = setTimeout(() => {
      debug('Timeout, no public IP found');
      pc.close();
      resolve(null);
    }, 5000);

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        debug('ICE gathering complete, no more candidates');
        clearTimeout(timeout);
        pc.close();
        resolve(null);
        return;
      }

      const candidateStr = event.candidate.candidate;
      debug('Got candidate:', candidateStr.substring(0, 100));

      const result = extractIPFromCandidate(candidateStr);
      if (result && isPublicIP(result.ip)) {
        debug('Found public IP:', result.ip, 'type:', result.type);
        clearTimeout(timeout);
        pc.close();
        resolve({ ip: result.ip, type: result.type as CandidateInfo['type'] });
      }
    };

    // Create a data channel to force ICE candidate gathering
    pc.createDataChannel('test');
    pc.createOffer().then((offer) => {
      debug('Set local offer');
      pc.setLocalDescription(offer);
    }).catch((err) => {
      debug('Error creating offer:', err);
      clearTimeout(timeout);
      pc.close();
      resolve(null);
    });
  });
}

/**
 * Get all discovered IPs via WebRTC (including local and public)
 */
export async function getAllIPs(): Promise<CandidateInfo[]> {
  return new Promise((resolve) => {
    const ips: CandidateInfo[] = [];
    const pc = new RTCPeerConnection({
      iceServers: STUN_SERVERS.map((url) => ({ urls: url })),
    });

    const timeout = setTimeout(() => {
      pc.close();
      resolve(ips);
    }, 5000);

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        clearTimeout(timeout);
        pc.close();
        resolve(ips);
        return;
      }

      const result = extractIPFromCandidate(event.candidate.candidate);
      if (result && isPublicIP(result.ip)) {
        if (!ips.some((i) => i.ip === result.ip)) {
          ips.push({ ip: result.ip, type: result.type as CandidateInfo['type'] });
        }
      }
    };

    pc.createDataChannel('test');
    pc.createOffer().then((offer) => {
      pc.setLocalDescription(offer);
    }).catch(() => {
      clearTimeout(timeout);
      pc.close();
      resolve(ips);
    });
  });
}
