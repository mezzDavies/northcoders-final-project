import React, { useState, useEffect } from "react";
import { Text, View, Image, TouchableHighlight } from "react-native";
import { getRecipeById } from "../../../api/firestoreFunctions.recipes";
import AddToShortList from "./AddToShortlist";
import DeleteRecipeFromList from "./DeleteRecipeFromList";

const SelectionListCard = ({
  navigation,
  recipeId,
  familyId,
  selectionListId,
  setSelectionList,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [recipe, setRecipe] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    getRecipeById(recipeId)
      .then(({ summary }) => {
        setRecipe(summary);
        setIsLoading(false);
      })
      .catch((err) => console.log(err));
  }, []);

  if (isLoading) return <Text>Loading...</Text>;

  const { id, image, readyInMinutes, servings, title } = recipe;

  return (
    <View>
      <TouchableHighlight
        onPress={() => {
          navigation.navigate("RecipePage", { id });
        }}
      >
        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      </TouchableHighlight>
      <Text>{`${title}`}</Text>
      <AddToShortList
        familyId={familyId}
        recipeId={recipeId}
        navigation={navigation}
        selectionListId={selectionListId}
      />
      <DeleteRecipeFromList
        recipeId={recipeId}
        selectionListId={selectionListId}
        setSelectionList={setSelectionList}
        recipe={recipe}
        familyId={familyId}
      />
    </View>
  );
};

export default SelectionListCard;
