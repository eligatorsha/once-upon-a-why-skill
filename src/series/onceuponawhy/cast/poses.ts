// ONCE UPON A WHY: body language per expression (bible §5.5). Mika is big and bouncy; Nora is precise and still.
// Use these as key poses and tween with mixPose(). Arm sx = forward raise, sz = out to the side, el = elbow.
import { Expr } from "./face";
import { Pose, pose } from "./rig";

export const MIKA_POSES: Record<Expr, Pose> = {
  neutral: pose({ armL: { sx: 0.05, sz: 0.22, el: 0.25 }, armR: { sx: 0.1, sz: 0.15, el: 0.3 } }),
  happy: pose({ armL: { sx: 0.2, sz: 0.5, el: 0.6 }, armR: { sx: 0.2, sz: 0.5, el: 0.6 }, head: [0, 0, 0.1], bob: 0.01 }),
  laughing: pose({ lean: -0.12, head: [-0.2, 0, 0.12], armL: { sx: 0.6, sz: 0.25, el: 1.9, ez: 0.4 }, armR: { sx: 0.6, sz: 0.25, el: 1.9, ez: 0.4 } }),
  shocked: pose({ lean: -0.1, head: [-0.08, 0, 0], armL: { sx: 0.4, sz: 0.9, el: 0.9 }, armR: { sx: 0.4, sz: 0.9, el: 0.9 }, squash: 1.04 }),
  panicked: pose({ head: [0, 0, 0.08], armL: { sx: 1.4, sz: 0.45, el: 2.25, ez: 0.3 }, armR: { sx: 1.4, sz: 0.45, el: 2.25, ez: 0.3 }, legL: { hip: 0.1, knee: 0.15, out: 0.05 }, legR: { hip: -0.05, knee: 0.1, out: 0.05 } }),
  anxious: pose({ lean: 0.05, head: [0.1, 0.15, 0], armL: { sx: 0.6, sz: 0.15, el: 1.6, ez: 0.7 }, armR: { sx: 0.6, sz: 0.15, el: 1.6, ez: 0.7 } }),
  thinking: pose({ head: [-0.1, 0.12, 0.12], armR: { sx: 0.9, sz: 0.18, el: 2.4, ez: 0.35 }, armL: { sx: 0.5, sz: 0.1, el: 1.6, ez: 0.8 } }),
  smug: pose({ lean: -0.06, head: [-0.06, -0.1, -0.12], side: 0.05, armL: { sx: -0.1, sz: 0.55, el: 1.7, ez: -0.3 }, armR: { sx: -0.1, sz: 0.55, el: 1.7, ez: -0.3 } }),
  sad: pose({ lean: 0.12, head: [0.3, 0, 0.06], armL: { sx: 0, sz: 0.05, el: 0.05 }, armR: { sx: 0, sz: 0.05, el: 0.05 }, squash: 0.96 }),
  proud: pose({ lean: -0.1, head: [-0.18, 0, 0], armL: { sx: -0.1, sz: 0.6, el: 1.7, ez: -0.4 }, armR: { sx: 2.9, sz: 0.35, el: 0.3 }, squash: 1.03 }),
  embarrassed: pose({ head: [0.12, -0.15, 0.1], armR: { sx: 0.4, sz: 1.5, el: 2.3 }, armL: { sx: 0.3, sz: 0.1, el: 1.2, ez: 0.6 } }),
  sleepy: pose({ lean: 0.1, head: [0.15, 0, 0.3], side: 0.06, armL: { sx: 0, sz: 0.05, el: 0.1 }, armR: { sx: 1.6, sz: 0.1, el: 1.4, ez: 0.3 }, squash: 0.97 }),
};

export const NORA_POSES: Record<Expr, Pose> = {
  neutral: pose({ armL: { sx: 0.05, sz: 0.1, el: 0.15 }, armR: { sx: 0.05, sz: 0.1, el: 0.15 } }),
  happy: pose({ head: [0, 0, 0.06], armL: { sx: 0.35, sz: 0.1, el: 1.2, ez: 0.5 }, armR: { sx: 0.35, sz: 0.1, el: 1.2, ez: 0.5 } }),
  laughing: pose({ lean: 0.05, head: [0.15, 0, 0.05], armR: { sx: 0.9, sz: 0.1, el: 2.3, ez: 0.4 }, armL: { sx: 0.5, sz: 0.1, el: 1.4, ez: 0.8 } }),
  shocked: pose({ lean: -0.08, head: [-0.05, 0, 0], armL: { sx: 0.5, sz: 0.3, el: 1.2 }, armR: { sx: 0.5, sz: 0.3, el: 1.2 }, squash: 1.03 }),
  panicked: pose({ head: [0.05, 0, 0], armL: { sx: 1.3, sz: 0.4, el: 2.3, ez: 0.35 }, armR: { sx: 1.3, sz: 0.4, el: 2.3, ez: 0.35 } }),
  anxious: pose({ lean: 0.05, head: [0.08, 0.1, 0], armL: { sx: 0.7, sz: 0.05, el: 1.4, ez: 0.6 }, armR: { sx: 0.7, sz: 0.05, el: 1.55, ez: 0.65 } }),
  // the glasses push: right index to the bridge
  thinking: pose({ head: [-0.12, 0.05, 0.06], armR: { sx: 2.3, sz: 0.1, el: 0.6, ez: 0 }, armL: { sx: 0.6, sz: 0.05, el: 1.5, ez: 0.8 } }),
  smug: pose({ lean: -0.04, head: [-0.1, 0.1, -0.08], armL: { sx: 0.5, sz: 0.05, el: 1.65, ez: 1.0 }, armR: { sx: 0.5, sz: 0.05, el: 1.75, ez: 1.1 } }),
  sad: pose({ lean: 0.1, head: [0.28, 0, 0.04], armL: { sx: 0.1, sz: 0.04, el: 0.2 }, armR: { sx: 0.1, sz: 0.04, el: 0.2 }, squash: 0.97 }),
  proud: pose({ lean: -0.06, head: [-0.15, 0, 0.04], armL: { sx: 0.6, sz: 0.1, el: 1.5, ez: 0.7 }, armR: { sx: 0.1, sz: 0.5, el: 1.7, ez: -0.3 }, squash: 1.02 }),
  embarrassed: pose({ head: [0.18, 0.12, 0.08], armL: { sx: 0.9, sz: 0.05, el: 2.2, ez: 0.3 }, armR: { sx: 0.95, sz: 0.05, el: 2.2, ez: 0.3 } }),
  sleepy: pose({ lean: 0.08, head: [0.2, 0, 0.2], armL: { sx: 0.2, sz: 0.05, el: 0.4 }, armR: { sx: 0.2, sz: 0.05, el: 0.4 }, squash: 0.97 }),
};

/** a wave (either character): raise the right arm and wag the forearm */
export const waveArm = (t: number) => ({ sx: 0.25, sz: 2.55, el: 0.35 + Math.sin(t * 0.55) * 0.35, ez: 0 });

/** seated on a chair (seat height 0.3), hands forward towards a desk */
export const NORA_CHAIR = pose({ drop: 0.2, lean: 0.05, legL: { hip: 1.5, knee: 1.5 }, legR: { hip: 1.5, knee: 1.45 }, armL: { sx: 0.95, sz: 0.1, el: 0.55, ez: 0.15 }, armR: { sx: 0.85, sz: 0.1, el: 0.7, ez: 0.15 } });
/** holding a hanging strap overhead (carriage) with the right arm */
export const STRAP_R = { sx: 0.3, sz: 2.75, el: 0.15, ez: 0 };
/** arguing: one arm thrown out, palm up */
export const MIKA_ARGUE = pose({ lean: 0.05, head: [-0.05, 0, 0.1], armL: { sx: 0.9, sz: 0.7, el: 0.6 }, armR: { sx: 0.3, sz: 0.3, el: 1.2, ez: 0.4 } });
/** arms crossed, chin up */
export const NORA_CROSSED = pose({ lean: -0.04, head: [-0.12, 0, -0.06], armL: { sx: 0.55, sz: 0.05, el: 1.7, ez: 1.05 }, armR: { sx: 0.5, sz: 0.05, el: 1.8, ez: 1.15 } });
/** asleep at a café table (ep 1): seated on a booth (seat ~0.3), leaning forward, cheek down on folded arms facing the
 *  camera (head tilted onto its right side). Tune the lean to the table height. */
export const MIKA_TABLE_NAP = pose({
  drop: 0.2,
  lean: 0.5,
  head: [-0.3, 0, -1.0],
  side: -0.08,
  legL: { hip: 1.5, knee: 1.5 },
  legR: { hip: 1.5, knee: 1.45 },
  armL: { sx: 1.25, sz: 0.25, el: 1.55, ez: 0.9 },
  armR: { sx: 1.2, sz: 0.25, el: 1.6, ez: 0.95 },
  squash: 0.98,
});
