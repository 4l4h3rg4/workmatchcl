import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';


export interface Story {
  id: string;
  userAvatar: string;
  userName: string;
  imageUrl: string;
  duration: number;
  viewed: boolean;
  expiration: number;
}

@Injectable({
  providedIn: 'root'
})
export class StoriesService {
  private stories: Story[] = JSON.parse(localStorage.getItem('stories') || '[]');

  constructor(private firestore: AngularFirestore) {
    this.cleanExpiredStories();
  }

  getStories(): Observable<Story[]> {
    return of(this.stories);
  }

  uploadStory(story: Story): Promise<void> {
    this.stories.push(story);
    localStorage.setItem('stories', JSON.stringify(this.stories));
    return Promise.resolve();
  }

  private cleanExpiredStories() {
    const now = Date.now();
    this.stories = this.stories.filter(story => story.expiration > now);
    localStorage.setItem('stories', JSON.stringify(this.stories));
  }
  
  markAsViewed(storyId: string): Promise<void> {
    const story = this.stories.find(s => s.id === storyId);
    if (story) {
      story.viewed = true;
    }
    return Promise.resolve();
  }

  getStoriesGroupedByUser(): Observable<{ [key: string]: Story[] }> {
    return this.getStories().pipe(
      map(stories => {
        const groupedStories = stories.reduce((acc, story) => {
          if (!acc[story.userName]) {
            acc[story.userName] = [];
          }
          acc[story.userName].push(story);
          return acc;
        }, {} as { [key: string]: Story[] });

        for (const user in groupedStories) {
          groupedStories[user].sort((a, b) => a.expiration - b.expiration);
        }

        return groupedStories;
      })
    );
  }

}