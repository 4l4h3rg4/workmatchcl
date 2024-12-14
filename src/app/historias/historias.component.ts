import { Component, OnInit } from '@angular/core';
import { StoriesService, Story } from '../services/stories.service';
import { UserService } from '../services/user.service'
import { ModalController } from '@ionic/angular';
import { StoryViewerComponent } from './story-viewer/story-viewer.component';
import { UploadStoryComponent } from '../upload-story/upload-story.component';


@Component({
  selector: 'app-historias',
  templateUrl: './historias.component.html',
  styleUrls: ['./historias.component.scss'],
})
export class HistoriasComponent implements OnInit {
  stories: Story[] = [];
  loading = false;
  groupedStories: { [key: string]: Story[] } = {};
  userId: string = 'currentUserId'; // Reemplaza con el ID del usuario actual


  constructor(
    private storiesService: StoriesService,
    private userService: UserService,
    private modalController: ModalController,
  ) {}

  ngOnInit() {
    this.storiesService.getStoriesGroupedByUser().subscribe(stories => {
      this.groupedStories = stories;
    });
  }

  async openStory(userName: string) {
    const stories = this.groupedStories[userName];
    const modal = await this.modalController.create({
      component: StoryViewerComponent,
      componentProps: {
        stories: stories,
        initialStory: stories[0]
      }
    });
    return await modal.present();
  }

  async uploadStory() {
    const modal = await this.modalController.create({
      component: UploadStoryComponent,
      cssClass: 'upload-story-modal'
    });

    await modal.present();
  }
}
