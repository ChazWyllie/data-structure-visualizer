/**
 * Step Engine Tests
 * Tests the playback engine logic for step-by-step visualization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StepEngine } from '../engine/step-engine';
import type { Step } from '../core/types';

// Helper to create mock steps
function createMockSteps(count: number): Step[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    description: `Step ${i + 1}`,
    snapshot: { data: { value: i } },
    meta: {
      comparisons: i,
      swaps: 0,
      reads: 0,
      writes: 0,
      highlightLine: i,
    },
  }));
}

describe('StepEngine', () => {
  let engine: StepEngine;
  let rafId = 0;
  const rafCallbacks = new Map<number, FrameRequestCallback>();

  beforeEach(() => {
    // Mock requestAnimationFrame and cancelAnimationFrame
    rafId = 0;
    rafCallbacks.clear();

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = ++rafId;
      rafCallbacks.set(id, callback);
      return id;
    });

    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      rafCallbacks.delete(id);
    });

    engine = new StepEngine();
  });

  afterEach(() => {
    engine.dispose();
    vi.unstubAllGlobals();
  });

  describe('initial state', () => {
    it('should start with empty steps and index 0', () => {
      const state = engine.getState();
      expect(state.steps).toEqual([]);
      expect(state.index).toBe(0);
      expect(state.playing).toBe(false);
    });

    it('should return null for getCurrentStep when empty', () => {
      expect(engine.getCurrentStep()).toBeNull();
    });

    it('should not be playing initially', () => {
      expect(engine.isPlaying()).toBe(false);
    });
  });

  describe('loadSteps', () => {
    it('should load steps and reset index to 0', () => {
      const steps = createMockSteps(5);
      engine.loadSteps(steps);

      const state = engine.getState();
      expect(state.steps).toHaveLength(5);
      expect(state.index).toBe(0);
    });

    it('should emit step-change and reset events when loading steps', () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      const steps = createMockSteps(3);
      engine.loadSteps(steps);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'step-change', index: 0 })
      );
      expect(listener).toHaveBeenCalledWith({ type: 'reset' });
    });

    it('should preserve speed setting when loading new steps', () => {
      engine.setSpeed(200);
      engine.loadSteps(createMockSteps(3));

      expect(engine.getState().speed).toBe(200);
    });

    it('should stop playback when loading new steps', () => {
      engine.loadSteps(createMockSteps(5));
      engine.play();
      expect(engine.isPlaying()).toBe(true);

      engine.loadSteps(createMockSteps(3));
      expect(engine.isPlaying()).toBe(false);
    });
  });

  describe('stepForward', () => {
    it('should advance to next step', () => {
      engine.loadSteps(createMockSteps(5));
      expect(engine.getState().index).toBe(0);

      engine.stepForward();
      expect(engine.getState().index).toBe(1);

      engine.stepForward();
      expect(engine.getState().index).toBe(2);
    });

    it('should emit step-change event', () => {
      engine.loadSteps(createMockSteps(5));
      const listener = vi.fn();
      engine.subscribe(listener);

      engine.stepForward();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'step-change', index: 1 })
      );
    });

    it('should not advance past last step', () => {
      engine.loadSteps(createMockSteps(3));
      engine.stepForward();
      engine.stepForward();
      expect(engine.getState().index).toBe(2);

      engine.stepForward(); // Should not advance
      expect(engine.getState().index).toBe(2);
    });
  });

  describe('stepBack', () => {
    it('should go back to previous step', () => {
      engine.loadSteps(createMockSteps(5));
      engine.stepForward();
      engine.stepForward();
      expect(engine.getState().index).toBe(2);

      engine.stepBack();
      expect(engine.getState().index).toBe(1);
    });

    it('should not go before first step', () => {
      engine.loadSteps(createMockSteps(5));
      expect(engine.getState().index).toBe(0);

      engine.stepBack(); // Should not go negative
      expect(engine.getState().index).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset to first step', () => {
      engine.loadSteps(createMockSteps(5));
      engine.stepForward();
      engine.stepForward();
      engine.stepForward();

      engine.reset();
      expect(engine.getState().index).toBe(0);
    });

    it('should pause playback', () => {
      engine.loadSteps(createMockSteps(5));
      engine.play();
      expect(engine.isPlaying()).toBe(true);

      engine.reset();
      expect(engine.isPlaying()).toBe(false);
    });

    it('should emit reset and step-change events', () => {
      engine.loadSteps(createMockSteps(5));
      engine.stepForward();

      const listener = vi.fn();
      engine.subscribe(listener);

      engine.reset();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'step-change', index: 0 })
      );
      expect(listener).toHaveBeenCalledWith({ type: 'reset' });
    });
  });

  describe('goToEnd', () => {
    it('should jump to last step', () => {
      engine.loadSteps(createMockSteps(5));

      engine.goToEnd();
      expect(engine.getState().index).toBe(4);
    });

    it('should pause playback', () => {
      engine.loadSteps(createMockSteps(5));
      engine.play();

      engine.goToEnd();
      expect(engine.isPlaying()).toBe(false);
    });

    it('should emit complete event', () => {
      engine.loadSteps(createMockSteps(5));
      const listener = vi.fn();
      engine.subscribe(listener);

      engine.goToEnd();

      expect(listener).toHaveBeenCalledWith({ type: 'complete' });
    });
  });

  describe('goToStep', () => {
    it('should jump to specific step', () => {
      engine.loadSteps(createMockSteps(10));

      engine.goToStep(5);
      expect(engine.getState().index).toBe(5);

      engine.goToStep(2);
      expect(engine.getState().index).toBe(2);
    });

    it('should ignore invalid indices', () => {
      engine.loadSteps(createMockSteps(5));
      engine.goToStep(2);

      engine.goToStep(-1);
      expect(engine.getState().index).toBe(2);

      engine.goToStep(100);
      expect(engine.getState().index).toBe(2);
    });
  });

  describe('play / pause', () => {
    it('should set playing state to true on play', () => {
      engine.loadSteps(createMockSteps(5));

      engine.play();
      expect(engine.isPlaying()).toBe(true);
    });

    it('should set playing state to false on pause', () => {
      engine.loadSteps(createMockSteps(5));
      engine.play();

      engine.pause();
      expect(engine.isPlaying()).toBe(false);
    });

    it('should emit play event', () => {
      engine.loadSteps(createMockSteps(5));
      const listener = vi.fn();
      engine.subscribe(listener);

      engine.play();

      expect(listener).toHaveBeenCalledWith({ type: 'play' });
    });

    it('should emit pause event', () => {
      engine.loadSteps(createMockSteps(5));
      engine.play();

      const listener = vi.fn();
      engine.subscribe(listener);

      engine.pause();

      expect(listener).toHaveBeenCalledWith({ type: 'pause' });
    });

    it('should not play if no steps loaded', () => {
      engine.play();
      expect(engine.isPlaying()).toBe(false);
    });

    it('should restart from beginning if at end', () => {
      engine.loadSteps(createMockSteps(3));
      engine.goToEnd();
      expect(engine.getState().index).toBe(2);

      const listener = vi.fn();
      engine.subscribe(listener);

      engine.play();

      // Should have reset to 0 and started playing
      expect(engine.getState().index).toBe(0);
      expect(engine.isPlaying()).toBe(true);
    });
  });

  describe('setSpeed', () => {
    it('should update speed setting', () => {
      engine.setSpeed(100);
      expect(engine.getState().speed).toBe(100);

      engine.setSpeed(1000);
      expect(engine.getState().speed).toBe(1000);
    });
  });

  describe('subscribe / unsubscribe', () => {
    it('should call listener on events', () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      engine.loadSteps(createMockSteps(3));

      expect(listener).toHaveBeenCalled();
    });

    it('should allow unsubscribing', () => {
      const listener = vi.fn();
      const unsubscribe = engine.subscribe(listener);

      unsubscribe();
      listener.mockClear();

      engine.loadSteps(createMockSteps(3));

      expect(listener).not.toHaveBeenCalled();
    });

    it('should support multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      engine.subscribe(listener1);
      engine.subscribe(listener2);

      engine.loadSteps(createMockSteps(3));

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('getCurrentStep', () => {
    it('should return current step', () => {
      const steps = createMockSteps(5);
      engine.loadSteps(steps);

      expect(engine.getCurrentStep()).toEqual(steps[0]);

      engine.stepForward();
      expect(engine.getCurrentStep()).toEqual(steps[1]);
    });
  });

  describe('dispose', () => {
    it('should stop playback and clear listeners', () => {
      const listener = vi.fn();
      engine.subscribe(listener);
      engine.loadSteps(createMockSteps(5));
      engine.play();

      engine.dispose();

      expect(engine.isPlaying()).toBe(false);

      // Clear the mock to check that no more events are received
      listener.mockClear();
      engine.loadSteps(createMockSteps(3));
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle loading empty steps array', () => {
      const listener = vi.fn();
      engine.subscribe(listener);

      engine.loadSteps([]);

      expect(engine.getState().steps).toEqual([]);
      expect(engine.getCurrentStep()).toBeNull();
      // Should not emit step-change for empty steps
      expect(listener).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'step-change' }));
    });

    it('should handle single step', () => {
      engine.loadSteps(createMockSteps(1));

      expect(engine.getState().index).toBe(0);
      engine.stepForward(); // Should not advance
      expect(engine.getState().index).toBe(0);
    });

    it('should handle rapid play/pause toggling', () => {
      engine.loadSteps(createMockSteps(10));

      engine.play();
      engine.pause();
      engine.play();
      engine.pause();

      expect(engine.isPlaying()).toBe(false);
      expect(engine.getState().index).toBe(0);
    });
  });
});
