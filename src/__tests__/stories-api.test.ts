import { describe, it, expect, vi, afterEach } from 'vitest';
import { GET as getStoriesHandler } from '../app/api/stories/route';
import { POST as postStoryHandler } from '../app/api/story/route';
import * as storyService from '../services/storyService';

vi.mock('../services/storyService', () => ({
  getStories: vi.fn(),
  createAndSaveStory: vi.fn(),
}));

const mockedStoryService = vi.mocked(storyService);

afterEach(() => {
  vi.clearAllMocks();
});

describe('Stories API', () => {
  it('GET /api/stories returns stories', async () => {
    const stories = [
      { id: 1, prompt: 'p1', content: 'c1', createdAt: new Date().toISOString() },
    ];
    mockedStoryService.getStories.mockResolvedValueOnce(stories);

    const res = await getStoriesHandler();
    expect(mockedStoryService.getStories).toHaveBeenCalledTimes(1);
    const data = await res.json();
    expect(data).toEqual(stories);
  });

  it('POST /api/story creates story', async () => {
    const newStory = {
      id: 1,
      prompt: 'Test prompt',
      content: 'generated story',
      createdAt: new Date().toISOString(),
    };
    mockedStoryService.createAndSaveStory.mockResolvedValueOnce(newStory);

    const req = new Request('http://localhost/api/story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Test prompt' }),
    });

    const res = await postStoryHandler(req);
    expect(mockedStoryService.createAndSaveStory).toHaveBeenCalledWith('Test prompt');
    const data = await res.json();
    expect(data).toEqual(newStory);
  });

  it('POST /api/story without prompt returns 400', async () => {
    const req = new Request('http://localhost/api/story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await postStoryHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toEqual({ error: 'Prompt is required' });
    expect(mockedStoryService.createAndSaveStory).not.toHaveBeenCalled();
  });
});

