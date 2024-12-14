import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../services/stories.service';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-story-viewer',
  templateUrl: './story-viewer.component.html',
  styleUrls: ['./story-viewer.component.scss']
})
export class StoryViewerComponent implements OnInit {
  @Input() stories: Story[] = [];
  @Input() initialStory!: Story;
  @Input() userAvatar: string = '';
  @Input() userName: string = '';
  currentStory!: Story;
  currentIndex: number = 0;
  selectedImages: string[] = [];
  timer: any;
  isUploading: boolean = false;


  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.currentIndex = this.stories.findIndex(s => s.id === this.initialStory.id);
    this.currentStory = this.stories[this.currentIndex];
    this.startTimer();
  }

  startTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.nextStory(), this.currentStory.duration * 1000);
  }

  getProgressStyle(story: Story) {
    const isCurrentStory = story.id === this.currentStory.id;
    const isPastStory = this.stories.indexOf(story) < this.currentIndex;
    
    return {
      'width': isPastStory ? '100%' : isCurrentStory ? '100%' : '0%',
      'transition': isCurrentStory ? `width ${this.currentStory.duration}s linear` : 'none'
    };
  }

  closeViewer() {
    if (this.timer) clearTimeout(this.timer);
    this.modalController.dismiss();
  }

  handleTouch(event: TouchEvent) {
    const touchX = event.changedTouches[0].clientX;
    const screenWidth = window.innerWidth;
    if (touchX < screenWidth / 2) {
      this.prevStory();
    } else {
      this.nextStory();
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  nextStory() {
    if (this.currentIndex < this.stories.length - 1) {
      this.currentIndex++;
      this.currentStory = this.stories[this.currentIndex];
      this.startTimer();
    } else {
      this.closeViewer();
    }
  }

  prevStory() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentStory = this.stories[this.currentIndex];
      this.startTimer();
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageUrl = e.target.result;
        const newStory: Story = {
          id: this.generateId(),
          userAvatar: this.userAvatar,
          userName: this.userName,
          imageUrl: imageUrl,
          duration: 5,
          viewed: false,
          expiration: Date.now() + 24 * 60 * 60 * 1000 // 24 horas
        };

        this.stories.push(newStory);
        this.currentStory = newStory;
        this.currentIndex = this.stories.length - 1;
        this.startTimer();
      };
      reader.readAsDataURL(files[0]);
    }
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
