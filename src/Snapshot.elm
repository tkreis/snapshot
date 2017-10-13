module Snapshot exposing (..)

import ElmHtml.InternalTypes exposing (Attribute(..), ElmHtml(..), EventHandler, Facts, NodeRecord, Tagger, decodeAttribute, decodeElmHtml)
import ElmHtml.ToElmString exposing (toElmString)
import ElmHtml.ToHtml
import ElmHtml.ToString
import Expect exposing (Expectation)
import Html exposing (Html, button, div, input, text)
import Json.Decode exposing (decodeValue)
import Json.Encode
import Native.HtmlAsJson
import Native.Snapshot
import Test


fromHtml : Html a -> Result String (ElmHtml msg)
fromHtml html =
    toJson html
        |> decodeValue (decodeElmHtml taggedEventDecoder)


type Msg
    = SomeMsg
    | InputMsg String
    | CheckMsg Bool


toJson : a -> Json.Decode.Value
toJson =
    Native.HtmlAsJson.unsafeCoerce


eventDecoder : EventHandler -> Json.Decode.Decoder msg
eventDecoder eventHandler =
    Native.HtmlAsJson.eventDecoder eventHandler


eventHandler : String -> Html a -> Json.Decode.Value
eventHandler eventName node =
    Native.HtmlAsJson.eventHandler eventName node


taggerFunction : Tagger -> (a -> msg)
taggerFunction tagger =
    Native.HtmlAsJson.taggerFunction tagger


taggedEventDecoder : List Tagger -> EventHandler -> Json.Decode.Decoder msg
taggedEventDecoder taggers eventHandler =
    case taggers of
        [] ->
            eventDecoder eventHandler

        [ tagger ] ->
            Json.Decode.map (taggerFunction tagger) (eventDecoder eventHandler)

        tagger :: taggers ->
            Json.Decode.map (taggerFunction tagger) (taggedEventDecoder taggers eventHandler)


type alias TestName =
    String


type SnapshotTypes
    = SavedSnapshot TestName


type alias Content =
    String


type Snapshot
    = FoundSnapshot Content
    | NotFoundSnapshot
    | Error String


fromJsonToSnapshot : String -> Maybe String -> Snapshot
fromJsonToSnapshot status content =
    case status of
        "found" ->
            FoundSnapshot (Maybe.withDefault "" content)

        "not_found" ->
            NotFoundSnapshot

        _ ->
            Error "unexpected error"


statusFileDecoder : Json.Decode.Decoder Snapshot
statusFileDecoder =
    Json.Decode.map2 fromJsonToSnapshot
        (Json.Decode.at [ "status" ] Json.Decode.string)
        (Json.Decode.maybe
            (Json.Decode.at [ "content" ] Json.Decode.string)
        )


readResponseFromJs : Result String Json.Decode.Value -> Snapshot
readResponseFromJs result =
    case result of
        Ok value ->
            case decodeValue statusFileDecoder value of
                Ok val ->
                    val

                Err err ->
                    Error err

        Err err ->
            Error err


createSnapshot : TestName -> String -> Snapshot
createSnapshot testName input =
    let
        response =
            readResponseFromJs (Native.Snapshot.save testName input)
    in
    FoundSnapshot input


readOrCreateSnapshot : TestName -> String -> Snapshot
readOrCreateSnapshot testName input =
    let
        response =
            readResponseFromJs (Native.Snapshot.tryToRead testName)
    in
    case response of
        FoundSnapshot content ->
            FoundSnapshot content

        NotFoundSnapshot ->
            createSnapshot testName input

        Error err ->
            Error err


htmlToString : Html a -> String
htmlToString html =
    html
        |> fromHtml
        |> Result.withDefault ElmHtml.InternalTypes.NoOp
        |> ElmHtml.ToString.nodeToString


equal : SnapshotTypes -> Html a -> Expect.Expectation
equal snapshotType html =
    case snapshotType of
        SavedSnapshot testName ->
            let
                htmlAsString =
                    htmlToString html

                savedSnapshot =
                    readOrCreateSnapshot testName htmlAsString
            in
            case savedSnapshot of
                FoundSnapshot content ->
                    Expect.equal htmlAsString content

                NotFoundSnapshot ->
                    -- can't get to expectation from Test.Expectation Fail/Pass
                    Expect.fail "Just created the snapshot the first time, please rerun."

                Error err ->
                    -- can't get to expectation from Test.Expectation Fail/Pass
                    Expect.fail ("Internal Snapshot error" ++ err)
