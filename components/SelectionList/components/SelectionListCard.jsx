import React, { useState, useEffect } from "react";
import { Text, View, Image } from "react-native";
import { getRecipeById } from "../../../api/firestoreFunctions";
import DeleteRecipeFromList from "./DeleteRecipeFromList";

const SelectionListCard = ({
  recipeId,
  familyId,
  selectionListId,
  setSelectionList,
}) => {
  const [recipe, setRecipe] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      <Text>{`${title}`}</Text>
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