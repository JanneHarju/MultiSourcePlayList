namespace PlayList.Models
{
    public class Track {
            public int id { get; set; }
            public int playlist { get; set; }
            public string address { get; set; } 
            public int order { get; set; } 
            public int type { get; set; } 
            public string name { get; set; } 
    }
}