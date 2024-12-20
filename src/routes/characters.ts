import { Router, Request, Response } from "express";
import { Character, Race } from "../Models/Models";
import { validationResult } from "express-validator";
import ModelValidator from "../validators/valIndex";
const router = Router();

router.post(
  "/",
  ModelValidator.checkCreateChar(),
  async function (req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    } else {
      try {
        const newCharacter = await Character.create(req.body);
        res
          .status(201)
          .json({ newCharacter, msg: "Character successfully created!" });
      } catch (error) {
        res.status(500).json({ error: "Failed to add new character" });
      }
    }
  }
);

router.get("/", async function (req: Request, res: Response) {
  try {
    const characters = await Character.findAll();
    res.status(200).json(characters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch characters" });
  }
});

router.get("/:charId", async function (req: Request, res: Response) {
  try {
    const character = await Character.findByPk(req.params.charId);
    if (character) {
      res.status(200).json(character);
    } else {
      res.status(404).json({ error: "Character not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch character" });
  }
});

router.get("/:charId/race", async function (req: Request, res: Response) {
  try {
    const character = await Character.findByPk(req.params.charId);
    if (!character) {
      res.status(404).json({ error: "Character not found" });
      return;
    }
    const race = await character.getRace();
    res.status(200).json(race);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch race" });
  }
});

router.get("/origin/:origin", async function (req, res) {
  try {
    const charsWithOrigin = [];
    const characters = await Character.findAll();
    for (let i = 0; i < characters.length; i++) {
      if (
        characters[i].origin.toLowerCase() == req.params.origin.toLowerCase()
      ) {
        charsWithOrigin.push(characters[i]);
      }
    }
    res.status(200).json(charsWithOrigin);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch characters" });
  }
});

router.post(
  "/:charId/races/:raceId",
  async function (req: Request, res: Response) {
    try {
      const character = await Character.findByPk(req.params.charId);
      if (!character) {
        res.status(404).json({ error: "Character not found" });
        return;
      }
      const race = await Race.findByPk(req.params.raceId);
      if (!race) {
        res.status(404).json({ error: "Race not found" });
        return;
      }
      await character.setRace(race);
      res.status(201).json({ msg: "Race successfully set for character!" });
    } catch (error) {
      res.status(500).json({ error: "Failed to set up association" });
    }
  }
);

router.patch(
  "/:charId",
  ModelValidator.checkCharPatch(),
  async function (req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    } else {
      try {
        await Character.update(req.body, {
          where: { id: req.params.charId },
        });
        const updatedChar = await Character.findByPk(req.params.charId);
        if (updatedChar) {
          res.status(200).json(updatedChar);
        } else {
          res.status(404).json({ error: "Character not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Failed to update character" });
      }
    }
  }
);

router.delete("/:charId", async function (req, res) {
  try {
    const deletedChar = await Character.destroy({
      where: { id: req.params.charId },
    });
    res.status(200).json({ msg: "Character successfully removed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete character" });
  }
});

//module.exports = router;
export default router;
