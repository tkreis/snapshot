module Example exposing (..)

import Expect exposing (Expectation)
import Html exposing (div)
import Html.Attributes exposing (class)
import Snapshot
import Test exposing (..)


suite : Test
suite =
    describe "Test suite"
        [ test "Can Parse to/from HTML " <|
            \() ->
                div [ class "hans" ] [] |> Snapshot.equal (Snapshot.SavedSnapshot "can-parse-html")
        ]
