# snapshot [ This is still a very early draft ]
Primitive way to add snapshot testing to elm-test. 

## How to use
Install `elm-package install tkreis/snapshot`

__Import__ 
```
import Snapshot
import Expect exposing (Expectation)
import Html exposing (div)
import Html.Attributes exposing (class)
import Test exposing (..)


suite : Test
suite =
    describe "Test suite"
        [ test "Can Parse to/from HTML " <|
            \() ->
                div [ class "hans" ] [] |> Snapshot.equal (Snapshot.SavedSnapshot "can-parse-html")
        ]
```        

__Run__

setup `SNAPSHOT_FOLDER` environment variable, which points to the folder where the snapshots are saved.

run `elm-test` like always. On the first run the snapshots are created and used for future comparision. 
