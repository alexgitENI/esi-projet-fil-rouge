#!/bin/zsh

# Recherche tous les fichiers Python contenant l'importation problématique
for file in $(grep -l 'from typing import.*UUID' -r --include='*.py' .)
do
  echo "Correcting $file"
  # Ajoute l'import de UUID depuis uuid et supprime UUID de l'import typing
  sed -i '' -E 's/from typing import ([^U]*)(UUID)([^U]*)/from typing import \1\3\nfrom uuid import UUID/' $file
done

# Vérifie s'il reste des importations problématiques après correction
remaining=$(grep -l 'from typing import.*UUID' -r --include='*.py' .)
if [[ -n "$remaining" ]]; then
  echo "\nLes fichiers suivants peuvent nécessiter une correction manuelle :"
  echo "$remaining"
fi
