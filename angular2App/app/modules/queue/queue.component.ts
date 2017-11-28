import { Component, OnInit } from '@angular/core';
import { Track } from '../../models/track';
import { PlayerService } from '../../services/player.service';

@Component({
    selector: 'my-queue',
    templateUrl: 'queue.component.html',
    styleUrls: [ './queue.component.css' ],
})

export class QueueComponent implements OnInit {
    tracklist: Track[] = [];
    constructor(
        private playerService: PlayerService)
    {
        this.tracklist = this.playerService.getQueueTracks();
    }

    ngOnInit() 
    {
        
    }

    delete(track: Track)
    {
        var index = this.tracklist.indexOf(track, 0);
        if (index > -1) {
            this.tracklist.splice(index, 1);
        }
    }
    
    onSelect(track: Track): void {

        //Maybe select track to play
        /*this.playerService.setTrackList(this.tracklist);
        this.playerService.setTrack(track);*/
        
    }
}