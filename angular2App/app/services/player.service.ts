import { Injectable } from '@angular/core';
import { Track } from '../models/track';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { TrackService } from '../services/track.service';

@Injectable()
export class PlayerService {

    private subject = new Subject<Track>();
    track: Track = new Track();
    tracklist: Track[] = [];
    random: number = 0;
    constructor(
        private trackService: TrackService
    )
    { }

    setTrack(newTrack: Track)
    {
        this.track = newTrack;
        this.subject.next(this.track);
    }
    getTrack() : Observable<Track>
    {
        return this.subject.asObservable();
    }
    setTrackList(tracklist : Track[])
    {
        this.tracklist = tracklist;
    }
    chooseNextTrack()
    {
        let nextTracks = this.tracklist.filter(x=>x.order > this.track.order);
        if(nextTracks != null && nextTracks.length > 0)
        {
            this.setTrack(nextTracks[0]);
        }
        else
        {
            this.setTrack(this.tracklist[0]);
        }
    }
    choosePreviousTrack()
    {
        let nextTracks = this.tracklist.filter(x=>x.order < this.track.order);
        if(nextTracks != null && nextTracks.length > 0)
        {
            this.setTrack(nextTracks[nextTracks.length-1]);
        }
        else
        {
            this.setTrack(this.tracklist[this.tracklist.length-1]);
        }
    }
    /*next()
    {
        this.chooseNextTrack();
    }*/
    /*previous()
    {
        let nextTracks = this.tracklist.filter(x=>x.order < this.track.order);
        //console.log("chooseNextTrack" + this.track.order);
        if(nextTracks != null && nextTracks.length > 0)
        {

            this.track = nextTracks[nextTracks.length-1];
            //console.log("next" + this.track.order);
        }
        else
        {
            this.track = this.tracklist[this.tracklist.length-1];
            //console.log("first");
        }
    }*/
    

    chooseNextRandomTrack()
    {
        this.random = Math.floor(Math.random() * this.tracklist.length);
        this.setTrack(this.tracklist[this.random]);
    }
}